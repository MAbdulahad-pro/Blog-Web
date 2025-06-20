import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchPostsByCategory,
  fetchCategories,
  fetchMedia,
} from '../../connection/Fetch-data';

// Configuration - moved outside component
const POST_COUNT_PER_CATEGORY = {
  0: 3,
  1: 2,
  2: 3,
  3: 2,
};

const DEFAULT_DISPLAY_COUNTS = [3, 2];
const MAX_PARALLEL_REQUESTS = 3; // Reduced concurrency for better performance
const MEDIA_BATCH_SIZE = 3; // Smaller batches

// Cache implementation
const dataCache = {
  categories: null,
  posts: {},
  media: {},
  timestamp: 0,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes cache
};

const CategoriesSections = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [mediaMap, setMediaMap] = useState({});
  const [postsByCategory, setPostsByCategory] = useState({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Check if cache is valid
  const isCacheValid = () => {
    return dataCache.timestamp &&
      Date.now() - dataCache.timestamp < dataCache.CACHE_DURATION;
  };

  // Get display count - memoized and simplified
  const getDisplayCount = useCallback((categoryId, index) => {
    return POST_COUNT_PER_CATEGORY[categoryId] || DEFAULT_DISPLAY_COUNTS[index % 2];
  }, []);

  // Get media URL with fallback - memoized
  const getMediaUrl = useCallback(
    (mediaId) => mediaMap[mediaId] || '/fallback-image.jpg',
    [mediaMap]
  );

  // Optimized media fetcher with concurrency control and caching
  const fetchMediaWithConcurrency = async (mediaIds) => {
    const uncachedIds = mediaIds.filter(id => !dataCache.media[id]);
    const batches = [];

    // Create batches of uncached media
    for (let i = 0; i < uncachedIds.length; i += MEDIA_BATCH_SIZE) {
      batches.push(uncachedIds.slice(i, i + MEDIA_BATCH_SIZE));
    }

    // Process batches with limited concurrency
    for (let i = 0; i < batches.length; i += MAX_PARALLEL_REQUESTS) {
      const currentBatches = batches.slice(i, i + MAX_PARALLEL_REQUESTS);
      const batchResults = await Promise.all(
        currentBatches.flatMap(batch =>
          batch.map(async id => {
            try {
              const data = await fetchMedia(id);
              dataCache.media[id] = data?.source_url || '/fallback-image.jpg';
              return [id, dataCache.media[id]];
            } catch {
              dataCache.media[id] = '/fallback-image.jpg';
              return [id, '/fallback-image.jpg'];
            }
          })
        )
      );

      // Update state with new media
      setMediaMap(prev => ({
        ...prev,
        ...Object.fromEntries(batchResults)
      }));
    }

    // Return all requested media (cached + newly fetched)
    return mediaIds.map(id => [id, dataCache.media[id] || '/fallback-image.jpg']);
  };

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchAllData = async () => {
      try {
        // Check cache first
        if (isCacheValid() && dataCache.categories) {
          setCategories(dataCache.categories);
          setPostsByCategory(dataCache.posts);
          setMediaMap(dataCache.media);
          setIsInitialLoad(false);
          return;
        }

        // Phase 1: Fetch categories first
        const allCategories = await fetchCategories({ signal: abortController.signal });
        const limitedCategories = allCategories.slice(0, 4);
        dataCache.categories = limitedCategories;
        if (!isMounted) return;
        setCategories(limitedCategories);

        // Phase 2: Fetch posts for all categories with concurrency control
        const postsResults = [];
        for (let i = 0; i < limitedCategories.length; i += MAX_PARALLEL_REQUESTS) {
          const batch = limitedCategories.slice(i, i + MAX_PARALLEL_REQUESTS);
          const batchResults = await Promise.all(
            batch.map(cat => {
              if (dataCache.posts[cat.id]) {
                return dataCache.posts[cat.id];
              }
              return fetchPostsByCategory(cat.id, { signal: abortController.signal })
                .catch(() => []);
            })
          );
          postsResults.push(...batchResults);
          if (!isMounted) return;
        }

        // Process posts and collect media IDs
        const categoryPostsMap = {};
        const mediaIdSet = new Set();

        postsResults.forEach((posts, index) => {
          const catId = limitedCategories[index].id;
          const validPosts = Array.isArray(posts) ? posts : [];
          categoryPostsMap[catId] = validPosts;
          dataCache.posts[catId] = validPosts;

          // Only collect media IDs for posts we'll actually display
          const displayCount = getDisplayCount(catId, index);
          validPosts.slice(0, displayCount).forEach(post => {
            if (post.featured_media) {
              mediaIdSet.add(post.featured_media);
            }
          });
        });

        if (!isMounted) return;
        setPostsByCategory(categoryPostsMap);

        // Phase 3: Fetch media with concurrency control
        const mediaIds = Array.from(mediaIdSet);
        if (mediaIds.length > 0) {
          await fetchMediaWithConcurrency(mediaIds);
        }

        // Update cache timestamp
        dataCache.timestamp = Date.now();
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching data:', error);
        }
      } finally {
        if (isMounted) {
          setIsInitialLoad(false);
        }
      }
    };

    fetchAllData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [getDisplayCount]);

  if (isInitialLoad && categories.length === 0) {
    return <SkeletonLoader />;
  }

  if (categories.length === 0) {
    return <NoCategoriesFound />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      {categories.map((category, index) => {
        const posts = postsByCategory[category.id] || [];
        if (posts.length === 0) return null;

        const displayCount = getDisplayCount(category.id, index);
        const postsToShow = posts.slice(0, displayCount);

        return (
          <CategorySection
            key={category.id}
            category={category}
            postsToShow={postsToShow}
            displayCount={displayCount}
            getMediaUrl={getMediaUrl}
            navigate={navigate}
            isFeatured={index === 1}
          />
        );
      })}
    </div>
  );
};

// Extracted components remain the same as previous version
const SkeletonLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
  </div>
);

const NoCategoriesFound = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
    <p>No categories found.</p>
  </div>
);

const CategorySection = ({ category, postsToShow, displayCount, getMediaUrl, navigate, isFeatured }) => {
  const gridCols = displayCount === 3
    ? 'grid-cols-1 md:grid-cols-3'
    : 'grid-cols-1 md:grid-cols-2';

  return (
    <section className="mb-16 last:mb-0">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4 py-1">
          {category.name}
        </h2>
        <button
          onClick={() => navigate(`/category/${category.id}`)}
          className="text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center group"
        >
          View all
          <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>

      <div className={`grid ${gridCols} gap-6`}>
        {postsToShow.map((post) =>
          isFeatured ? (
            <FeaturedPost
              key={post.id}
              post={post}
              category={category}
              mediaUrl={getMediaUrl(post.featured_media)}
              onClick={() => navigate(`/post/${post.id}`)}
            />
          ) : (
            <StandardPost
              key={post.id}
              post={post}
              category={category}
              mediaUrl={getMediaUrl(post.featured_media)}
              onClick={() => navigate(`/post/${post.id}`)}
            />
          )
        )}
      </div>
    </section>
  );
};

const FeaturedPost = ({ post, category, mediaUrl, onClick }) => (
  <article
    className="relative h-[350px] md:h-[400px] rounded-xl overflow-hidden group cursor-pointer transition-all duration-300"
    onClick={onClick}
  >
    <div className="absolute inset-0">
      <img
        src={mediaUrl}
        alt={post.title.rendered}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
    </div>

    <div className="absolute bottom-0 left-0 w-full p-6">
      <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 shadow-md">
        {category.name}
      </span>
      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
        {post.title.rendered}
      </h3>
      <SafeExcerpt content={post.excerpt?.rendered} className="text-sm text-gray-200 line-clamp-2" />
      <button className="mt-3 text-white hover:text-blue-200 font-medium flex items-center transition-colors group-readmore">
        Read full story
        <span className="ml-2 group-readmore-hover:translate-x-1 transition-transform">→</span>
      </button>
    </div>
  </article>
);

const StandardPost = ({ post, category, mediaUrl, onClick }) => (
  <article
    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col h-full cursor-pointer"
    onClick={onClick}
  >
    <div className="relative overflow-hidden">
      <img
        src={mediaUrl}
        alt={post.title.rendered}
        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute top-4 left-4">
        <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
          {category.name}
        </span>
      </div>
    </div>

    <div className="p-5 flex flex-col flex-grow">
      <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
        {post.title.rendered}
      </h3>
      <SafeExcerpt content={post.excerpt?.rendered} className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3" />
      <button className="mt-auto text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors group-readmore">
        Read more
        <span className="ml-2 group-readmore-hover:translate-x-1 transition-transform">→</span>
      </button>
    </div>
  </article>
);

const SafeExcerpt = ({ content, className }) => {
  if (!content) return null;
  const cleanHtml = content.replace(/<script.*?>.*?<\/script>/gi, '');
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};

export default CategoriesSections;