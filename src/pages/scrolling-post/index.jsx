import React, { useEffect, useState } from 'react';
import { fetchPosts, fetchCategories } from '../../connection/Fetch-data';
import { useNavigate } from 'react-router-dom';

const POSTS_PER_PAGE = 7;

const Scrolling_post = () => {
    const navigate = useNavigate();
    const [allPosts, setAllPosts] = useState([]);
    const [visiblePosts, setVisiblePosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const getData = async () => {
            try {
                const posts = await fetchPosts();
                const cats = await fetchCategories();
                setAllPosts(posts);
                setVisiblePosts(posts.slice(0, POSTS_PER_PAGE));
                setCategories(cats);
            } catch (err) {
                console.error('Error loading data:', err);
            }
        };

        getData();
    }, []);

    const handleLoadMore = () => {
        const nextPage = currentPage + 1;
        const newVisiblePosts = allPosts.slice(0, nextPage * POSTS_PER_PAGE);
        setVisiblePosts(newVisiblePosts);
        setCurrentPage(nextPage);
    };

    const getImageUrl = (post) => {
        return post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/fallback-image.jpg';
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 px-4 py-12 max-w-7xl mx-auto">
            {/* Main Section */}
            <div className="w-full md:w-[70%] space-y-8">
                <h1 className="text-3xl font-bold mb-4 text-gray-900">Latest Posts</h1>

                {visiblePosts.map((post) => (
                    <article
                        key={post.id}
                        onClick={() => navigate(`/post/${post.id}`)}
                        className="bg-white rounded-xl shadow hover:shadow-md transition cursor-pointer overflow-hidden group flex flex-col md:flex-row"
                    >
                        <div className="w-full md:w-1/4 h-56 md:h-48">
                            <img
                                src={getImageUrl(post)}
                                alt={post.title.rendered}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>

                        <div className="w-full md:w-3/4 p-6 flex flex-col justify-between">
                            <div>
                                <h2
                                    className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition"
                                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                                />
                                <div
                                    className="text-sm text-gray-600 line-clamp-3"
                                    dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                                />
                            </div>
                            <button className="mt-auto text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors group-readmore">
                                Read more
                                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                            </button>
                        </div>
                    </article>
                ))}

                {/* Load More Button */}
                {visiblePosts.length < allPosts.length && (
                    <div className="flex justify-center mt-10">
                        <button
                            onClick={handleLoadMore}
                            className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>

            {/* Sidebar */}
            <div className="w-full h-auto md:w-[30%] bg-white top-17 sticky">
                <div className='sticky top-[-200px]'>
                    <div className='rounded-2xl shadow-md border border-gray-200 p-6'>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Categories</h2>

                        {categories.length === 0 ? (
                            <p className="text-gray-500 text-sm">No categories found.</p>
                        ) : (
                            <ul className="space-y-3">
                                {categories.map((category) => (
                                    <li
                                        key={category.id}
                                        onClick={() => navigate(`/category/${category.id}`)}
                                        className="bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition px-4 py-2 rounded-lg cursor-pointer shadow-sm hover:shadow"
                                    >
                                        {category.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className='rounded-2xl bg-gray-100 h-[400px] shadow-md border border-gray-200 mt-5 flex items-center justify-center '>
                        <h2 className="text-[20px] font-400 text-gray-300">For Ads banner</h2>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Scrolling_post;
