import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchPostsByCategory,
  fetchCategories,
  fetchMedia,
} from '../../connection/Fetch-data';

const postCountPerCategory = {
  0: 3,
  1: 2,
  2: 3,
  3: 2,
};

const CategoriesSections = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [mediaMap, setMediaMap] = useState({});
  const [postsByCategory, setPostsByCategory] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const getDisplayCount = (categoryId, index) => {
    return postCountPerCategory[categoryId] || [3, 2][index % 2];
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);

        const allCategories = await fetchCategories();
        const limitedCategories = allCategories.slice(0, 4);
        setCategories(limitedCategories);

        const postsResults = await Promise.all(
          limitedCategories.map(cat => fetchPostsByCategory(cat.id))
        );

        const categoryPostsMap = {};
        const mediaIds = [];

        postsResults.forEach((posts, index) => {
          const catId = limitedCategories[index].id;
          const validPosts = posts || [];
          categoryPostsMap[catId] = validPosts;

          validPosts.forEach(post => {
            if (post.featured_media) {
              mediaIds.push(post.featured_media);
            }
          });
        });

        // Unique media IDs only
        const uniqueMediaIds = [...new Set(mediaIds)];

        const mediaResults = await Promise.all(
          uniqueMediaIds.map(async id => {
            try {
              const data = await fetchMedia(id);
              return [id, data?.source_url || '/fallback-image.jpg'];
            } catch {
              return [id, '/fallback-image.jpg'];
            }
          })
        );

        const mediaObj = Object.fromEntries(mediaResults);

        setPostsByCategory(categoryPostsMap);
        setMediaMap(mediaObj);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const getMediaUrl = mediaId => mediaMap[mediaId] || '/fallback-image.jpg';

  if (categories.length === 0 || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      {categories.map((category, index) => {
        const posts = postsByCategory[category.id] || [];
        if (posts.length === 0) return null;

        const displayCount = getDisplayCount(category.id, index);
        const postsToShow = posts.slice(0, displayCount);

        const gridCols =
          displayCount === 3
            ? 'grid-cols-1 md:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-2';

        return (
          <section key={category.id} className="mb-16 last:mb-0">
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
              {postsToShow.map(post =>
                index === 1 ? (
                  <article
                    key={post.id}
                    className="relative h-[350px] md:h-[400px] rounded-xl overflow-hidden group cursor-pointer transition-all duration-300"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    <div className="absolute inset-0">
                      <img
                        src={getMediaUrl(post.featured_media)}
                        alt={post.title.rendered}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                      <div
                        className="text-sm text-gray-200 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                      />
                      <button className="mt-3 text-white hover:text-blue-200 font-medium flex items-center transition-colors group-readmore">
                        Read full story
                        <span className="ml-2 group-readmore-hover:translate-x-1 transition-transform">→</span>
                      </button>
                    </div>
                  </article>
                ) : (
                  <article
                    key={post.id}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col h-full cursor-pointer"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={getMediaUrl(post.featured_media)}
                        alt={post.title.rendered}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
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
                      <div
                        className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                      />
                      <button className="mt-auto text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors group-readmore">
                        Read more
                        <span className="ml-2 group-readmore-hover:translate-x-1 transition-transform">→</span>
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default CategoriesSections;
