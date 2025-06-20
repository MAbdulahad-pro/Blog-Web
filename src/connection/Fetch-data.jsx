const BASE_URL = 'http://localhost:8080/blog-web/wordpress/wp-json/wp/v2';

// Fetch all posts with embedded data (like featured media)
export const fetchPosts = async () => {
  try {
    const response = await fetch(`${BASE_URL}/posts?_embed`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Fetch search results
export const fetchSearch = async () => {
  try {
    const response = await fetch(`${BASE_URL}/search`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};

// Fetch logo
export const fetchLogo = async () => {
  try {
    const response = await fetch(`${BASE_URL}/logo`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching logo:', error);
    throw error;
  }
};

// Fetch pages or menu items
export const fetchPages = async () => {
  try {
    const response = await fetch(`${BASE_URL}/menu`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching pages/menu:', error);
    throw error;
  }
};

// Fetch single post by ID with embedded data
export const fetchPostById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/posts/${id}?_embed`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching single post:', error);
    throw error;
  }
};

// Fetch all categories
export const fetchCategories = async () => {
  try {
    const response = await fetch(`${BASE_URL}/categories`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Fetch posts by category ID with embedded data
export const fetchPostsByCategory = async (categoryId) => {
  try {
    const response = await fetch(`${BASE_URL}/posts?categories=${categoryId}&_embed`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching posts by category:', error);
    throw error;
  }
};

// Fetch media by media ID
export const fetchMedia = async (mediaId) => {
  try {
    const response = await fetch(`${BASE_URL}/media/${mediaId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching media:', error);
    throw error;
  }
};

// Get page name via media ID (duplicate of fetchMedia, can be merged or renamed properly)
export const getPageName = async (mediaId) => {
  try {
    const response = await fetch(`${BASE_URL}/media/${mediaId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching page name:', error);
    throw error;
  }
};

// Fetch search results with query
export const fetchSearchData = async (searchTerm) => {
  try {
    const response = await fetch(`${BASE_URL}/posts?search=${searchTerm}&_fields=id,title,slug,excerpt`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};