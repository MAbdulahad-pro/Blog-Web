import React, { useEffect, useState } from 'react';
import { fetchPages, fetchLogo, fetchSearchData } from '../../connection/Fetch-data';
import searchIcon from '../../assets/Icons/search-icon.svg';
import menu from '../../assets/Icons/menu.svg';
import cross from '../../assets/Icons/close-icon.svg';

const Navbar = () => {
  const [pages, setPages] = useState([]);
  const [logo, setLogo] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pagesName, Logo] = await Promise.all([fetchPages(), fetchLogo()]);
        setPages(pagesName);
        setLogo(Array.isArray(Logo) ? Logo : [Logo]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const openSearchModal = () => setIsSearchOpen(true);
  const closeSearchModal = () => {
    setIsSearchOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleSearchChange = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim().length > 2) {
      setIsSearching(true);
      try {
        const data = await fetchSearchData(term);
        setSearchResults(data || []);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  return (
    <header
      className={`w-full z-50 transition-all duration-300 ${isScrolled
        ? 'fixed top-0 bg-white/90 shadow-md backdrop-blur-md py-2 border-b border-gray-100'
        : 'relative bg-white py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          {logo.map((item, index) => (
            <a key={index} href="/" className="block w-36 h-auto">
              <img
                src={item.logo_url}
                alt="Logo"
                className={`object-contain transition-all duration-300 ${isScrolled ? 'h-10' : 'h-12'
                  }`}
              />
            </a>
          ))}
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-8">
          {pages
            .filter((parent) => parent.menu_item_parent === '0')
            .map((parent) => {
              const children = pages.filter(
                (child) => child.menu_item_parent === String(parent.ID)
              );
              return (
                <div key={parent.ID} className="relative group">
                  <a
                    href={parent.url}
                    className="text-gray-800 font-medium hover:text-blue-600 transition-colors duration-200 px-2 py-1 rounded-md"
                    dangerouslySetInnerHTML={{ __html: parent.title }}
                  />
                  {children.length > 0 && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 z-50 border border-gray-100">
                      <ul className="py-2">
                        {children.map((child) => (
                          <li key={child.ID}>
                            <a
                              href={child.url}
                              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                              dangerouslySetInnerHTML={{ __html: child.title }}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}

          {/* Search Button */}
          <button
            onClick={openSearchModal}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition duration-200 shadow-sm"
          >

            <img src={searchIcon} alt="Search" />
            <span className="text-sm">Search</span>
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-700 focus:outline-none p-2 rounded-md hover:bg-gray-100 transition-colors"
          >

            <img src={menu} alt="Search" />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg transition-all duration-300">
          <ul className="px-4 py-3 space-y-2">
            {pages
              .filter((parent) => parent.menu_item_parent === '0')
              .map((parent) => {
                const children = pages.filter(
                  (child) => child.menu_item_parent === String(parent.ID)
                );
                return (
                  <li key={parent.ID} className="py-2">
                    <a
                      href={parent.url}
                      className="block text-gray-900 font-medium py-2 px-2 rounded hover:bg-gray-50"
                      dangerouslySetInnerHTML={{ __html: parent.title }}
                    />
                    {children.length > 0 && (
                      <ul className="pl-4 mt-1 space-y-1 border-l-2 border-gray-200">
                        {children.map((child) => (
                          <li key={child.ID} className="py-1">
                            <a
                              href={child.url}
                              className="block text-gray-600 hover:text-blue-500 px-2 py-1 rounded hover:bg-gray-50"
                              dangerouslySetInnerHTML={{ __html: child.title }}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
      )}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-fadeIn">
          <div
            className="bg-white p-5 rounded-xl w-full max-w-2xl shadow-2xl transform transition-all duration-300 ease-out animate-slideDown"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeSearchModal}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close search"
            >
              <img src={cross} alt="cross" />
            </button>

            {/* Search Input */}
            <div className="relative mb-5">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <img src={searchIcon} alt="Search" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search articles, topics, and more..."
                className="w-full pl-10 pr-4 py-3.5 text-gray-800 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                autoFocus
              />
              {isSearching && (
                <div className="absolute right-3 top-3.5">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-r-2 border-blue-500"></div>
                </div>
              )}
            </div>

            {/* Search Results */}
            <div className="max-h-[50vh] overflow-y-auto transition-all duration-300">
              {searchResults.length > 0 ? (
                <div className="space-y-3 pr-2">
                  {searchResults.map((post) => (
                    <a
                      key={post.id}
                      href={`/post/${post.id}`}
                      className="block p-4 border border-gray-200 rounded-xl hover:bg-blue-50 transition-colors duration-200 hover:shadow-sm group"
                    >
                      <h3
                        className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200 mb-1.5"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered || post.title }}
                      />
                      <p
                        className="text-sm text-gray-600 line-clamp-2"
                        dangerouslySetInnerHTML={{
                          __html: post.excerpt?.rendered || post.excerpt || '',
                        }}
                      />
                      <div className="mt-2 flex items-center">
                        <span className="inline-block bg-gray-100 text-xs px-2 py-1 rounded text-gray-500">
                          Read article
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : searchTerm.length > 2 && !isSearching ? (
                <div className="py-8 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500">
                    No results found for <span className="font-medium text-gray-700">"{searchTerm}"</span>
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Try different keywords or check your spelling</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
