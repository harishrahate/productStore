// API handling functions
const API_BASE_URL = 'https://fakestoreapi.com';
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;

// Fetch data with retry mechanism
async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
    try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
        
        // Add signal to options
        const fetchOptions = {
            ...options,
            signal: controller.signal
        };
        
        // Attempt fetch
        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);
        
        // Check if response is ok
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        // Handle timeout or network errors
        console.error(`Fetch error (${retries} retries left):`, error);
        
        if (retries > 0) {
            console.log(`Retrying fetch to ${url}...`);
            return fetchWithRetry(url, options, retries - 1);
        }
        
        // All retries failed
        throw error;
    }
}

// API functions
async function getProducts() {
    return fetchWithRetry(`${API_BASE_URL}/products`);
}

async function getProduct(id) {
    return fetchWithRetry(`${API_BASE_URL}/products/${id}`);
}

async function getCategories() {
    return fetchWithRetry(`${API_BASE_URL}/products/categories`);
}

// Fallback data in case API fails completely
const fallbackProducts = [
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
    }
];

// Load products with fallback
async function loadProductsWithFallback() {
    try {
        return await getProducts();
    } catch (error) {
        console.error("Failed to load products from API, using fallback data:", error);
        return fallbackProducts;
    }
}

// Load product with fallback
async function loadProductWithFallback(id) {
    try {
        return await getProduct(id);
    } catch (error) {
        console.error(`Failed to load product ${id} from API, using fallback data:`, error);
        return fallbackProducts.find(p => p.id === parseInt(id)) || null;
    }
}