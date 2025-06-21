// Category page functionality
let allProducts = [];
let filteredProducts = [];
let categoryProducts = [];
let displayedProducts = [];
let productsPerPage = 8;
let currentPage = 0;
let pageCategory = '';

document.addEventListener('DOMContentLoaded', function() {
    // Get category from data attribute
    const categoryData = document.body.getAttribute('data-category');
    if (categoryData) {
        pageCategory = categoryData;
        
        // Update page title based on category
        document.title = getCategoryDisplayName(pageCategory) + ' - Product Store';
        
        // Render search and filter components
        const searchFilterContainer = document.getElementById('search-filter-container');
        if (searchFilterContainer) {
            const placeholder = `Search ${getCategoryDisplayName(pageCategory).toLowerCase()}...`;
            searchFilterContainer.innerHTML = renderSearchFilter(placeholder);
        }
        
        // Initialize search and filter functionality
        initSearchAndFilter(applyFilters);
        
        // Load products for this category
        loadCategoryProducts();
    }
    
    // Initialize other components
    updateCartCount();
    updateWishlistCount();
    updateAuthLink();
    setupInfiniteScroll();
});

function getCategoryDisplayName(category) {
    // Handle multiple categories (like men's clothing,women's clothing)
    if (category.includes(',')) {
        return 'Clothing';
    }
    
    // Format category name for display
    switch(category) {
        case 'electronics':
            return 'Electronics';
        case 'jewelery':
            return 'Jewelry';
        case "men's clothing":
            return "Men's Clothing";
        case "women's clothing":
            return "Women's Clothing";
        default:
            return category.charAt(0).toUpperCase() + category.slice(1);
    }
}

function showSkeletonCards(count = 8) {
    const skeletonHTML = Array(count).fill().map(() => `
        <div class="skeleton-card">
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton skeleton-text title"></div>
            <div class="skeleton skeleton-text price"></div>
            <div class="skeleton skeleton-button"></div>
        </div>
    `).join('');
    document.getElementById('products-grid').innerHTML = skeletonHTML;
}

async function loadCategoryProducts() {
    showSkeletonCards();
    try {
        // Try to load from localStorage cache first
        const cachedProducts = localStorage.getItem('cachedProducts');
        const cacheTimestamp = localStorage.getItem('productsCacheTimestamp');
        let data;
        
        if (cachedProducts && cacheTimestamp) {
            // Check if cache is less than 1 hour old
            const cacheAge = Date.now() - parseInt(cacheTimestamp);
            if (cacheAge < 3600000) { // 1 hour in milliseconds
                console.log('Using cached products data');
                data = JSON.parse(cachedProducts);
            }
        }
        
        // If no valid cache, try API
        if (!data) {
            try {
                // Add timeout to prevent hanging requests
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
                
                const response = await fetch('https://fakestoreapi.com/products', { 
                    signal: controller.signal,
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                data = await response.json();
                
                // Cache the results
                localStorage.setItem('cachedProducts', JSON.stringify(data));
                localStorage.setItem('productsCacheTimestamp', Date.now().toString());
            } catch (apiError) {
                console.error('API fetch error:', apiError);
                
                // Try to use expired cache if available
                if (cachedProducts) {
                    console.log('Using expired cached products');
                    data = JSON.parse(cachedProducts);
                } else {
                    // Use hardcoded fallback data
                    console.log('Using fallback product data');
                    data = getFallbackProducts();
                }
            }
        }
        
        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error('Invalid data format or empty data');
        }
        
        allProducts = data;
        // Make products available globally
        window.allProducts = allProducts;
        
        // Filter products for this category
        filterProductsByCategory();
        
        // Display the filtered products
        displayProducts(categoryProducts);
        
        // Load categories for navigation
        loadCategories();
        
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('products-grid').innerHTML = `
            <div class="error-container">
                <p>Error loading products. Please try again later.</p>
                <button onclick="retryLoadCategoryProducts()" class="btn-primary">Retry</button>
            </div>
        `;
    }
}

// Fallback products data
function getFallbackProducts() {
    return [
        {
            id: 1,
            title: "Fjallraven - Foldsack No. 1 Backpack",
            price: 109.95,
            description: "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
            category: "men's clothing",
            image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
            rating: { rate: 3.9, count: 120 }
        },
        {
            id: 2,
            title: "Mens Casual Premium Slim Fit T-Shirts",
            price: 22.3,
            description: "Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing.",
            category: "men's clothing",
            image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
            rating: { rate: 4.1, count: 259 }
        },
        {
            id: 3,
            title: "Mens Cotton Jacket",
            price: 55.99,
            description: "Great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions, such as working, hiking, camping, mountain/rock climbing, cycling, traveling or other outdoors.",
            category: "men's clothing",
            image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
            rating: { rate: 4.7, count: 500 }
        },
        {
            id: 4,
            title: "Women's 3-in-1 Snowboard Jacket",
            price: 56.99,
            description: "Note: The Jackets is US standard size, Please choose size as your usual wear. Material: 100% Polyester; Detachable Liner Fabric: Warm Fleece.",
            category: "women's clothing",
            image: "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg",
            rating: { rate: 2.6, count: 235 }
        },
        {
            id: 5,
            title: "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet",
            price: 695,
            description: "From our Legends Collection, the Naga was inspired by the mythical water dragon that protects the ocean's pearl. Wear facing inward to be bestowed with love and abundance, or outward for protection.",
            category: "jewelery",
            image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg",
            rating: { rate: 4.6, count: 400 }
        },
        {
            id: 8,
            title: "WD 2TB Elements Portable External Hard Drive - USB 3.0",
            price: 64,
            description: "USB 3.0 and USB 2.0 Compatibility Fast data transfers Improve PC Performance High Capacity; Compatibility Formatted NTFS for Windows 10, Windows 8.1, Windows 7",
            category: "electronics",
            image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
            rating: { rate: 3.3, count: 203 }
        }
    ];
}

function retryLoadCategoryProducts() {
    loadCategoryProducts();
}

function filterProductsByCategory() {
    if (pageCategory.includes(',')) {
        // Handle multiple categories
        const categories = pageCategory.split(',');
        categoryProducts = allProducts.filter(product => categories.includes(product.category));
    } else {
        // Single category
        categoryProducts = allProducts.filter(product => product.category === pageCategory);
    }
    
    filteredProducts = categoryProducts;
    
    // Update count in page title
    updateResultsCount(categoryProducts.length);
}

function updateResultsCount(count) {
    const pageTitle = document.getElementById('page-title');
    const baseTitle = getCategoryDisplayName(pageCategory);
    pageTitle.textContent = `${baseTitle} (${count} found)`;
}

async function loadCategories() {
    try {
        // Try to load from localStorage cache first
        const cachedCategories = localStorage.getItem('cachedCategories');
        const cacheTimestamp = localStorage.getItem('categoriesCacheTimestamp');
        let categories;
        
        if (cachedCategories && cacheTimestamp) {
            // Check if cache is less than 1 day old
            const cacheAge = Date.now() - parseInt(cacheTimestamp);
            if (cacheAge < 86400000) { // 24 hours in milliseconds
                console.log('Using cached categories data');
                categories = JSON.parse(cachedCategories);
            }
        }
        
        // If no valid cache, try API
        if (!categories) {
            try {
                // Add timeout to prevent hanging requests
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
                
                const response = await fetch('https://fakestoreapi.com/products/categories', { 
                    signal: controller.signal,
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                categories = await response.json();
                
                // Cache the results
                localStorage.setItem('cachedCategories', JSON.stringify(categories));
                localStorage.setItem('categoriesCacheTimestamp', Date.now().toString());
            } catch (apiError) {
                console.error('API fetch error for categories:', apiError);
                
                // Try to use expired cache if available
                if (cachedCategories) {
                    console.log('Using expired cached categories');
                    categories = JSON.parse(cachedCategories);
                } else {
                    // Use hardcoded fallback data
                    console.log('Using fallback categories data');
                    categories = ["electronics", "jewelery", "men's clothing", "women's clothing"];
                }
            }
        }
        
        displayCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        // Ultimate fallback
        const fallbackCategories = ["electronics", "jewelery", "men's clothing", "women's clothing"];
        displayCategories(fallbackCategories);
    }
}

function displayCategories(categories) {
    const categoryList = document.getElementById('category-list');
    
    // Create category links
    const categoryLinks = [
        { name: 'All Products', url: 'index.html', active: false },
        { name: 'Electronics', url: 'electronics.html', active: pageCategory === 'electronics' },
        { name: 'Clothing', url: 'clothing.html', active: pageCategory.includes('clothing') },
        { name: 'Jewelry', url: 'jewelry.html', active: pageCategory === 'jewelery' }
    ];
    
    categoryList.innerHTML = categoryLinks.map(cat => 
        `<li><a href="${cat.url}" ${cat.active ? 'class="active"' : ''}>${cat.name}</a></li>`
    ).join('');
}

function applyFilters() {
    // Get filter values from the component
    const filterValues = getFilterValues();
    
    // Start with category products
    let products = [...categoryProducts];
    
    // Enhanced search - title, description
    if (filterValues.searchTerm) {
        products = products.filter(product => 
            product.title.toLowerCase().includes(filterValues.searchTerm) ||
            (product.description && product.description.toLowerCase().includes(filterValues.searchTerm))
        );
    }
    
    // Price range filter
    if (filterValues.minPrice > 0 || filterValues.maxPrice < Infinity) {
        products = products.filter(product => 
            product.price >= filterValues.minPrice && product.price <= filterValues.maxPrice
        );
    }
    
    // Rating filter (simulate ratings)
    if (filterValues.selectedRating) {
        const minRating = parseFloat(filterValues.selectedRating);
        products = products.filter(product => {
            const rating = getProductRating(product.id);
            return rating >= minRating;
        });
    }
    
    // Availability filters (simulate stock and sale status)
    if (filterValues.inStockOnly) {
        products = products.filter(product => isInStock(product.id));
    }
    
    if (filterValues.onSaleOnly) {
        products = products.filter(product => isOnSale(product.id));
    }
    
    // Sort products
    products = sortProducts(products, filterValues.sortBy);
    
    filteredProducts = products;
    displayProducts(products);
    
    // Update active filters
    const filters = getActiveFilters();
    updateActiveFilters(filters);
    
    updateResultsCount(products.length);
}

function sortProducts(products, sortBy) {
    switch (sortBy) {
        case 'price-low':
            return products.sort((a, b) => a.price - b.price);
        case 'price-high':
            return products.sort((a, b) => b.price - a.price);
        case 'name':
            return products.sort((a, b) => a.title.localeCompare(b.title));
        case 'rating':
            return products.sort((a, b) => getProductRating(b.id) - getProductRating(a.id));
        case 'newest':
            return products.sort((a, b) => b.id - a.id);
        default:
            return products;
    }
}

function getProductRating(productId) {
    // First check if we have user ratings
    const userRatings = getProductRatings(productId);
    if (userRatings.count > 0) {
        return userRatings.average;
    }
    
    // Otherwise use API ratings
    const product = allProducts.find(p => p.id === productId);
    return product && product.rating ? product.rating.rate : 0;
}

function isInStock(productId) {
    // Simulate stock status (90% in stock)
    return (productId * 13) % 10 !== 0;
}

function isOnSale(productId) {
    // Simulate sale status (30% on sale)
    return (productId * 17) % 10 < 3;
}

function displayProducts(products, append = false) {
    const productsGrid = document.getElementById('products-grid');
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p>No products found in this category.</p>';
        return;
    }
    
    if (!append) {
        currentPage = 0;
        displayedProducts = [];
    }
    
    const startIndex = currentPage * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = products.slice(startIndex, endIndex);
    
    displayedProducts = append ? [...displayedProducts, ...productsToShow] : productsToShow;
    
    productsGrid.innerHTML = displayedProducts.map(product => `
        <div class="product-card">
            <button onclick="addToWishlist(${product.id}, '${product.title.replace(/'/g, "\\'")}', ${product.price}, '${product.image}')" class="wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}">♥</button>
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title.substring(0, 50)}${product.title.length > 50 ? '...' : ''}</h3>
            ${addRatingToProductCard(product)}
            <p class="price">$${product.price}</p>
            <button onclick="addToCart(${product.id}, '${product.title.replace(/'/g, "\\'")}', ${product.price}, '${product.image}')" class="btn-primary">Add to Cart</button>
            <br><br>
            <a href="product.html?id=${product.id}" class="btn-primary" style="text-decoration: none; display: inline-block;">View Details</a>
        </div>
    `).join('');
}

function loadMoreProducts() {
    if ((currentPage + 1) * productsPerPage >= filteredProducts.length) return;
    
    currentPage++;
    const startIndex = currentPage * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const newProducts = filteredProducts.slice(startIndex, endIndex);
    
    if (newProducts.length > 0) {
        displayedProducts = [...displayedProducts, ...newProducts];
        appendProductsToGrid(newProducts);
    }
}

function appendProductsToGrid(products) {
    const productsGrid = document.getElementById('products-grid');
    const newHTML = products.map(product => `
        <div class="product-card">
            <button onclick="addToWishlist(${product.id}, '${product.title.replace(/'/g, "\\'")}', ${product.price}, '${product.image}')" class="wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}">♥</button>
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title.substring(0, 50)}${product.title.length > 50 ? '...' : ''}</h3>
            ${addRatingToProductCard(product)}
            <p class="price">$${product.price}</p>
            <button onclick="addToCart(${product.id}, '${product.title.replace(/'/g, "\\'")}', ${product.price}, '${product.image}')" class="btn-primary">Add to Cart</button>
            <br><br>
            <a href="product.html?id=${product.id}" class="btn-primary" style="text-decoration: none; display: inline-block;">View Details</a>
        </div>
    `).join('');
    
    productsGrid.innerHTML += newHTML;
}

function addLoadingIndicator() {
    if (document.getElementById('loading-indicator')) return;
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-indicator';
    loadingDiv.innerHTML = '<div class="spinner"><div class="spinner-ring"></div></div>';
    loadingDiv.style.textAlign = 'center';
    loadingDiv.style.padding = '20px';
    document.querySelector('.container').appendChild(loadingDiv);
}

function removeLoadingIndicator() {
    const loadingDiv = document.getElementById('loading-indicator');
    if (loadingDiv) loadingDiv.remove();
}

let isLoading = false;

function setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
        if (isLoading) return;
        
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            if ((currentPage + 1) * productsPerPage < filteredProducts.length) {
                isLoading = true;
                addLoadingIndicator();
                setTimeout(() => {
                    loadMoreProducts();
                    removeLoadingIndicator();
                    isLoading = false;
                }, 300);
            }
        }
    });
}