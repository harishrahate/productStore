// Reusable UI Components

// Render search and filter components
function renderSearchFilter(placeholder = "Search products, brands, categories...") {
  return `
    <div class="search-filter">
      <div class="search-section">
        <input type="text" id="search-input" placeholder="${placeholder}">
        <button id="clear-search" class="clear-btn" style="display: none;">✕</button>
      </div>
      
      <div class="filter-section">
        <select id="sort-select">
          <option value="">Sort by</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name A-Z</option>
          <option value="rating">Rating</option>
          <option value="newest">Newest First</option>
        </select>
        
        <div class="price-filter">
          <label>Price Range:</label>
          <div class="price-inputs">
            <input type="number" id="min-price" placeholder="Min" min="0">
            <span>-</span>
            <input type="number" id="max-price" placeholder="Max" min="0">
          </div>
        </div>
        
        <button id="advanced-filter-btn" class="filter-toggle-btn">🔧 Filters</button>
      </div>
    </div>
    
    <div id="advanced-filters" class="advanced-filters" style="display: none;">
      <div class="filter-group">
        <h4>Rating</h4>
        <div class="rating-filter">
          <label><input type="radio" name="rating" value=""> All Ratings</label>
          <label><input type="radio" name="rating" value="4"> 4+ Stars</label>
          <label><input type="radio" name="rating" value="3"> 3+ Stars</label>
          <label><input type="radio" name="rating" value="2"> 2+ Stars</label>
        </div>
      </div>
      
      <div class="filter-group">
        <h4>Availability</h4>
        <div class="availability-filter">
          <label><input type="checkbox" id="in-stock"> In Stock Only</label>
          <label><input type="checkbox" id="on-sale"> On Sale</label>
        </div>
      </div>
      
      <div class="filter-actions">
        <button id="apply-filters" class="btn-primary">Apply Filters</button>
        <button id="clear-filters" class="btn-secondary">Clear All</button>
      </div>
    </div>
    
    <div id="active-filters" class="active-filters" style="display: none;">
      <span class="filter-label">Active Filters:</span>
      <div id="filter-tags"></div>
    </div>
  `;
}

// Initialize search and filter functionality
function initSearchAndFilter(applyFiltersCallback) {
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const minPrice = document.getElementById('min-price');
  const maxPrice = document.getElementById('max-price');
  const clearSearch = document.getElementById('clear-search');
  const advancedFilterBtn = document.getElementById('advanced-filter-btn');
  const applyFiltersBtn = document.getElementById('apply-filters');
  const clearFiltersBtn = document.getElementById('clear-filters');
  
  // Handle search input
  searchInput.addEventListener('input', function() {
    if (this.value.trim()) {
      clearSearch.style.display = 'block';
    } else {
      clearSearch.style.display = 'none';
    }
    applyFiltersCallback();
  });
  
  // Clear search
  clearSearch.addEventListener('click', function() {
    searchInput.value = '';
    clearSearch.style.display = 'none';
    applyFiltersCallback();
  });
  
  // Toggle advanced filters
  advancedFilterBtn.addEventListener('click', function() {
    const advancedFilters = document.getElementById('advanced-filters');
    if (advancedFilters.style.display === 'none') {
      advancedFilters.style.display = 'block';
      this.textContent = '🔧 Hide Filters';
    } else {
      advancedFilters.style.display = 'none';
      this.textContent = '🔧 Filters';
    }
  });
  
  // Apply filters
  sortSelect.addEventListener('change', applyFiltersCallback);
  minPrice.addEventListener('input', applyFiltersCallback);
  maxPrice.addEventListener('input', applyFiltersCallback);
  applyFiltersBtn.addEventListener('click', applyFiltersCallback);
  
  // Rating filter
  document.querySelectorAll('input[name="rating"]').forEach(radio => {
    radio.addEventListener('change', applyFiltersCallback);
  });
  
  // Availability filters
  document.getElementById('in-stock').addEventListener('change', applyFiltersCallback);
  document.getElementById('on-sale').addEventListener('change', applyFiltersCallback);
  
  // Clear all filters
  clearFiltersBtn.addEventListener('click', function() {
    searchInput.value = '';
    minPrice.value = '';
    maxPrice.value = '';
    clearSearch.style.display = 'none';
    document.querySelectorAll('input[name="rating"]').forEach(radio => radio.checked = false);
    document.getElementById('in-stock').checked = false;
    document.getElementById('on-sale').checked = false;
    sortSelect.selectedIndex = 0;
    
    applyFiltersCallback();
  });
}

// Update active filters display
function updateActiveFilters(filters) {
  const activeFiltersContainer = document.getElementById('active-filters');
  const filterTags = document.getElementById('filter-tags');
  
  if (filters.length > 0) {
    filterTags.innerHTML = filters.map(filter => 
      `<span class="filter-tag">${filter} <button onclick="removeFilter('${filter}')">&times;</button></span>`
    ).join('');
    activeFiltersContainer.style.display = 'block';
  } else {
    activeFiltersContainer.style.display = 'none';
  }
}

// Get current filter values
function getFilterValues() {
  return {
    searchTerm: document.getElementById('search-input').value.toLowerCase(),
    sortBy: document.getElementById('sort-select').value,
    minPrice: parseFloat(document.getElementById('min-price').value) || 0,
    maxPrice: parseFloat(document.getElementById('max-price').value) || Infinity,
    selectedRating: document.querySelector('input[name="rating"]:checked')?.value,
    inStockOnly: document.getElementById('in-stock').checked,
    onSaleOnly: document.getElementById('on-sale').checked
  };
}

// Get active filters as array of strings
function getActiveFilters() {
  const filters = [];
  const values = getFilterValues();
  
  if (values.searchTerm) filters.push(`Search: "${values.searchTerm}"`);
  if (values.minPrice > 0) filters.push(`Min Price: ${values.minPrice}`);
  if (values.maxPrice < Infinity) filters.push(`Max Price: ${values.maxPrice}`);
  if (values.selectedRating) filters.push(`${values.selectedRating}+ Stars`);
  if (values.inStockOnly) filters.push('In Stock');
  if (values.onSaleOnly) filters.push('On Sale');
  
  return filters;
}