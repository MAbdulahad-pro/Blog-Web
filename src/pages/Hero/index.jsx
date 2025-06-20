import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPosts, fetchCategories } from '../../connection/Fetch-data';

const categoryColors = {
  technology: 'bg-gradient-to-r from-[#00c6ff] to-[#0072ff]',
  lifestyle: 'bg-gradient-to-r from-[#ff758c] to-[#ff7eb3]',
  travel: 'bg-gradient-to-r from-[#43e97b] to-[#38f9d7]',
  food: 'bg-gradient-to-r from-[#f7971e] to-[#ffd200]',
  education: 'bg-gradient-to-r from-[#ff0844] to-[#ffb199]',
  default: 'bg-gradient-to-r from-[#7F00FF] to-[#E100FF]',
};

const Hero = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [postsData, categoriesData] = await Promise.all([
          fetchPosts(),
          fetchCategories()
        ]);
        setPosts(postsData);
        setAllCategories(categoriesData);
      } catch (err) {
        console.error('Error loading posts:', err);
      }
    };
    loadContent();
  }, []);

  const [latestPost, ...recentPosts] = posts;

  const getFeaturedImage = (post) =>
    post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/fallback-image.jpg';

  const getCategoryName = (id) =>
    allCategories.find((c) => c.id === id)?.name || 'Uncategorized';

  const getCategoryStyle = (id) => {
    const slug = allCategories.find((c) => c.id === id)?.slug;
    return categoryColors[slug] || categoryColors.default;
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
      <section className="flex flex-col lg:flex-row gap-8">
        {/* Featured Post */}
        {latestPost && (
          <div
            className="w-full lg:w-1/2 relative group cursor-pointer rounded-xl overflow-hidden"
            onClick={() => navigate(`/post/${latestPost.id}`)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && navigate(`/post/${latestPost.id}`)}
          >
            <div className="relative h-[423px] w-full rounded-xl overflow-hidden shadow-lg">
              <img
                src={getFeaturedImage(latestPost)}
                alt={latestPost.title.rendered}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = '/fallback-image.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 rounded-xl" />
              <div className="absolute bottom-0 left-0 w-full p-6 lg:p-8">
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-white text-xs font-semibold tracking-wide ${getCategoryStyle(
                      latestPost.categories[0]
                    )}`}
                  >
                    {getCategoryName(latestPost.categories[0])}
                  </span>
                  <span className="text-white/90 text-sm font-medium">
                    {formatDate(latestPost.date)}
                  </span>
                </div>
                <h3
                  className="text-white text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-2"
                  dangerouslySetInnerHTML={{ __html: latestPost.title.rendered }}
                />
                <p className="text-white/80 text-sm md:text-base line-clamp-2">
                  {latestPost.excerpt?.rendered.replace(/<[^>]+>/g, '')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Posts */}
        <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {recentPosts.slice(0, 4).map((post) => (
            <div
              key={post.id}
              className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              onClick={() => navigate(`/post/${post.id}`)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && navigate(`/post/${post.id}`)}
            >
              <div className="relative h-[180px] sm:h-[200px] rounded-lg overflow-hidden">
                <img
                  src={getFeaturedImage(post)}
                  alt={post.title.rendered}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = '/fallback-image.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
                <div className="absolute bottom-0 left-0 w-full p-4">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-white text-[10px] font-semibold tracking-wide ${getCategoryStyle(
                        post.categories[0]
                      )}`}
                    >
                      {getCategoryName(post.categories[0])}
                    </span>
                    <span className="text-white text-xs font-medium">
                      {formatDate(post.date)}
                    </span>
                  </div>
                  <h4
                    className="text-white text-sm font-semibold leading-snug group-hover:text-blue-300 transition-colors duration-300 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Hero;
