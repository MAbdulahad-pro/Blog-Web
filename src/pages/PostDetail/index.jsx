import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPostById, fetchMedia } from '../../connection/Fetch-data';


const Post = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [media, setMedia] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setIsLoading(true);
        const postData = await fetchPostById(10);
        setPost(postData);
        setIsLoading(false);
      } catch (error) {
        console.error("Post fetch error", error);
        setIsLoading(false);
      }
    };

    fetchPostData();
  }, [id]);

  useEffect(() => {
    const fetchMediaData = async () => {
      if (post && post.featured_media) {
        try {
          const data = await fetchMedia(post.featured_media);
          setMedia(data);
        } catch (error) {
          console.error("Fetch media error:", error);
        }
      }
    };

    fetchMediaData();
  }, [post]);


  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
    </div>
  );

  if (!post) return <div className="min-h-screen flex items-center justify-center text-xl">Post will finding</div>;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <article className="max-w-5xl mx-auto px-6 py-10 sm:px-8 lg:px-12 bg-white">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors font-medium"
        aria-label="Back to Posts"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Posts
      </button>

      {/* Featured Image */}
      {media && media.source_url && (
        <div className="mb-10 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
          <img
            src={media.source_url}
            alt={post.title.rendered}
            className="w-full h-auto max-h-[520px] object-cover"
          />
        </div>
      )}

      {/* Post Header */}
      <header className="mb-12">
        <h1
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />

        <div className="flex flex-wrap items-center gap-6 text-gray-600 text-sm sm:text-base">
          <time className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(post.date)}</span>
          </time>

          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>By Admin</span>
          </div>

          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h4l3 8 4-16 3 8h4" />
            </svg>
            <span>Category: {post.categories && post.categories.length > 0 ? post.categories.join(', ') : "General"}</span>
          </div>
        </div>
      </header>

      {/* Post Content */}
      <section
        className="prose prose-lg max-w-none prose-blue prose-headings:text-gray-900
        prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-img:rounded-lg
        prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-gray-50
        prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
        prose-blockquote:text-gray-700"
        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
      />

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <aside className="mt-14">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Tags</h3>
          <div className="flex flex-wrap gap-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm cursor-pointer hover:bg-blue-200 transition"
              >
                {tag}
              </span>
            ))}
          </div>
        </aside>
      )}

    </article>
  );
};

export default Post;
