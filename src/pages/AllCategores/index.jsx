import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPostsByCategory, fetchCategories } from "../../connection/Fetch-data";

const CategoryPages = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [media, setMedia] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (categoryId) {
          const categoryPosts = await fetchPostsByCategory(categoryId);
          setPosts(Array.isArray(categoryPosts) ? categoryPosts : []);
          setActiveCategory(parseInt(categoryId));
        }
        const allCategories = await fetchCategories();
        setCategories(allCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [categoryId]);

  useEffect(() => {
    fetch("http://localhost:8080/blog-web/wordpress/wp-json/wp/v2/media")
      .then((response) => response.json())
      .then((data) => setMedia(data))
      .catch((error) => console.error("Fetch media error:", error));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Animated Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 animate-text">
          Discover Our Categories
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore our collection of posts organized by topics that matter to you.
        </p>
      </div>

      {/* Categories Navigation */}
      <div className="mb-16 overflow-x-auto">
        <div className="flex space-x-2 pb-4">
          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(`/category/${item.id}`);
                setActiveCategory(item.id);
              }}
              className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${activeCategory === item.id
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 shadow-md"
                }`}
              dangerouslySetInnerHTML={{ __html: item.name }}
            />
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => {
            const mediaItem = media.find((item) => item.id === post.featured_media);
            return (
              <article
                key={post.id}
                className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col overflow-hidden transform hover:-translate-y-2"
                onClick={() => navigate(`/post/${post.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/post/${post.id}`)}
              >
                {/* Image with gradient overlay */}
                <div className="relative overflow-hidden h-56">
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={mediaItem ? mediaItem.source_url : "/fallback-image.jpg"}
                    alt={post.title.rendered.replace(/<[^>]+>/g, '')}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  {/* Category badge */}
                  <span className="self-start px-3 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-full mb-3">
                    {categories.find(cat => cat.id === post.categories[0])?.name || 'Uncategorized'}
                  </span>

                  <h3
                    className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300"
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                  />
                  <p
                    className="text-gray-600 flex-grow line-clamp-3 mb-4"
                    dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                  />

                  {/* Author and date */}
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gray-300 mr-3 overflow-hidden">
                      {/* Placeholder for author avatar */}
                    </div>
                    <div>
                      <span>Admin</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-auto flex justify-between items-center border-t pt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('Share functionality coming soon!');
                      }}
                      className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-300"
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/post/${post.id}`);
                      }}
                      className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors duration-300 group-hover:shadow-lg"
                    >
                      Read More
                      <svg className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <svg className="w-20 h-20 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-6 text-xl font-medium text-gray-900">No posts found</h3>
            <p className="mt-2 text-gray-600">There are currently no posts in this category. Please check back later.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors duration-300"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPages;