// Product Rating and Review System
function getProductRatings(productId) {
    const ratings = JSON.parse(localStorage.getItem('productRatings') || '{}');
    return ratings[productId] || { average: 0, count: 0, reviews: [] };
}

function addProductRating(productId, rating, review = '') {
    const user = getCurrentUser();
    if (!user) return false;
    
    const ratings = JSON.parse(localStorage.getItem('productRatings') || '{}');
    if (!ratings[productId]) {
        ratings[productId] = { reviews: [], total: 0, count: 0 };
    }
    
    // Check if user already reviewed
    const existingReviewIndex = ratings[productId].reviews.findIndex(r => r.userId === user.email);
    
    const newReview = {
        userId: user.email,
        userName: user.name,
        rating: rating,
        review: review,
        date: new Date().toISOString()
    };
    
    if (existingReviewIndex >= 0) {
        // Update existing review
        const oldRating = ratings[productId].reviews[existingReviewIndex].rating;
        ratings[productId].total = ratings[productId].total - oldRating + rating;
        ratings[productId].reviews[existingReviewIndex] = newReview;
    } else {
        // Add new review
        ratings[productId].reviews.push(newReview);
        ratings[productId].total = (ratings[productId].total || 0) + rating;
        ratings[productId].count++;
    }
    
    ratings[productId].average = ratings[productId].total / ratings[productId].count;
    localStorage.setItem('productRatings', JSON.stringify(ratings));
    return true;
}

function getUserRating(productId) {
    const user = getCurrentUser();
    if (!user) return null;
    
    const ratings = getProductRatings(productId);
    return ratings.reviews.find(r => r.userId === user.email);
}

function renderStars(rating, interactive = false, productId = null) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHtml = '';
    
    for (let i = 1; i <= 5; i++) {
        const filled = i <= rating;
        const className = interactive ? 'star interactive' : 'star';
        const clickHandler = interactive ? `onclick="setRating(${i}, ${productId})"` : '';
        const starIcon = filled ? '★' : '☆';
        
        starsHtml += `<span class="${className}" data-rating="${i}" ${clickHandler}>${starIcon}</span>`;
    }
    
    return starsHtml;
}

function setRating(rating, productId) {
    const stars = document.querySelectorAll('.star.interactive');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.textContent = '★';
            star.classList.add('selected');
        } else {
            star.textContent = '☆';
            star.classList.remove('selected');
        }
    });
    
    document.getElementById('selected-rating').value = rating;
}

function displayProductRatings(productId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Get user ratings from localStorage
    const userRatings = getProductRatings(productId);
    const userReview = getUserRating(productId);
    const user = getCurrentUser();
    
    // Get API ratings if available
    let apiRating = 0;
    let apiCount = 0;
    const product = window.allProducts ? window.allProducts.find(p => p.id === parseInt(productId)) : null;
    if (product && product.rating) {
        apiRating = product.rating.rate;
        apiCount = product.rating.count;
    }
    
    // Use user ratings if available, otherwise use API ratings
    const displayRating = userRatings.count > 0 ? userRatings.average : apiRating;
    const displayCount = userRatings.count > 0 ? userRatings.count : apiCount;
    
    container.innerHTML = `
        <div class="ratings-section">
            <div class="rating-summary">
                <div class="average-rating">
                    <div class="rating-stars">${renderStars(displayRating)}</div>
                    <div class="rating-text">
                        <span class="rating-number">${displayRating.toFixed(1)}</span>
                        <span class="rating-count">(${displayCount} reviews)</span>
                    </div>
                </div>
                
                <div class="rating-breakdown">
                    ${userRatings.count > 0 ? generateRatingBreakdown(userRatings.reviews) : '<p>No detailed breakdown available</p>'}
                </div>
            </div>
            
            ${user ? `
                <div class="add-review">
                    <h4>${userReview ? 'Update Your Review' : 'Write a Review'}</h4>
                    <div class="rating-input">
                        <label>Your Rating:</label>
                        <div class="star-input">
                            ${renderStars(userReview?.rating || 0, true, productId)}
                        </div>
                        <input type="hidden" id="selected-rating" value="${userReview?.rating || 0}">
                    </div>
                    <div class="review-input">
                        <textarea id="review-text" placeholder="Share your experience with this product..." maxlength="500">${userReview?.review || ''}</textarea>
                        <div class="char-count"><span id="char-count">0</span>/500</div>
                    </div>
                    <button onclick="submitReview(${productId})" class="btn-primary">
                        ${userReview ? 'Update Review' : 'Submit Review'}
                    </button>
                </div>
            ` : `
                <div class="login-prompt">
                    <p>Please <a href="login.html">login</a> to write a review</p>
                </div>
            `}
            
            <div class="reviews-list">
                <h4>Customer Reviews</h4>
                ${displayReviews(userRatings.reviews)}
            </div>
        </div>
    `;
    
    // Setup character counter
    const textarea = document.getElementById('review-text');
    const charCount = document.getElementById('char-count');
    if (textarea && charCount) {
        textarea.addEventListener('input', function() {
            charCount.textContent = this.value.length;
        });
        charCount.textContent = textarea.value.length;
    }
}

function generateRatingBreakdown(reviews) {
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
        breakdown[review.rating]++;
    });
    
    const total = reviews.length;
    if (total === 0) return '<p>No reviews yet</p>';
    
    return Object.keys(breakdown).reverse().map(rating => {
        const count = breakdown[rating];
        const percentage = total > 0 ? (count / total) * 100 : 0;
        return `
            <div class="rating-bar">
                <span class="rating-label">${rating} ★</span>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="rating-count">${count}</span>
            </div>
        `;
    }).join('');
}

function displayReviews(reviews) {
    if (reviews.length === 0) {
        return '<p class="no-reviews">No reviews yet. Be the first to review this product!</p>';
    }
    
    return reviews.sort((a, b) => new Date(b.date) - new Date(a.date)).map(review => `
        <div class="review-item">
            <div class="review-header">
                <div class="reviewer-info">
                    <span class="reviewer-name">${review.userName}</span>
                    <div class="review-rating">${renderStars(review.rating)}</div>
                </div>
                <span class="review-date">${formatReviewDate(review.date)}</span>
            </div>
            ${review.review ? `<div class="review-text">${review.review}</div>` : ''}
        </div>
    `).join('');
}

function formatReviewDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function submitReview(productId) {
    const rating = parseInt(document.getElementById('selected-rating').value);
    const review = document.getElementById('review-text').value.trim();
    
    if (rating === 0) {
        showToast('Please select a rating', 'error');
        return;
    }
    
    if (addProductRating(productId, rating, review)) {
        showToast('Review submitted successfully!', 'success');
        displayProductRatings(productId, 'product-ratings');
    } else {
        showToast('Please login to submit a review', 'error');
    }
}

// Add ratings to product cards
function addRatingToProductCard(product) {
    try {
        // First check if we have user ratings
        const userRatings = getProductRatings(product.id);
        
        // If we have user ratings, use those
        if (userRatings.count > 0) {
            return `
                <div class="product-rating">
                    ${renderStars(userRatings.average)}
                    <span class="rating-count">(${userRatings.count})</span>
                </div>
            `;
        }
        
        // Otherwise use API ratings
        if (product.rating) {
            return `
                <div class="product-rating">
                    ${renderStars(product.rating.rate)}
                    <span class="rating-count">(${product.rating.count})</span>
                </div>
            `;
        }
        
        // Fallback if no ratings available
        return `
            <div class="product-rating">
                ${renderStars(0)}
                <span class="rating-count">(0)</span>
            </div>
        `;
    } catch (error) {
        console.error('Error rendering product rating:', error);
        return `
            <div class="product-rating">
                ${renderStars(0)}
                <span class="rating-count">(0)</span>
            </div>
        `;
    }
}tings.count > 0) {
            return `
                <div class="product-rating">
                    ${renderStars(userRatings.average)}
                    <span class="rating-count">(${userRatings.count})</span>
                </div>
            `;
        }
        
        // Otherwise use API ratings
        if (product.rating) {
            return `
                <div class="product-rating">
                    ${renderStars(product.rating.rate)}
                    <span class="rating-count">(${product.rating.count})</span>
                </div>
            `;
        }
        
        // Fallback if no ratings available
        return `
            <div class="product-rating">
                ${renderStars(0)}
                <span class="rating-count">(0)</span>
            </div>
        `;
    } catch (error) {
        console.error('Error rendering product rating:', error);
        return `
            <div class="product-rating">
                ${renderStars(0)}
                <span class="rating-count">(0)</span>
            </div>
        `;
    }
}tings.count > 0) {
            return `
                <div class="product-rating">
                    ${renderStars(userRatings.average)}
                    <span class="rating-count">(${userRatings.count})</span>
                </div>
            `;
        }
        
        // Otherwise use API ratings
        if (product.rating) {
            return `
                <div class="product-rating">
                    ${renderStars(product.rating.rate)}
                    <span class="rating-count">(${product.rating.count})</span>
                </div>
            `;
        }
        
        // Fallback if no ratings available
        return `
            <div class="product-rating">
                ${renderStars(0)}
                <span class="rating-count">(0)</span>
            </div>
        `;
    } catch (error) {
        console.error('Error rendering product rating:', error);
        return `
            <div class="product-rating">
                ${renderStars(0)}
                <span class="rating-count">(0)</span>
            </div>
        `;
    }
}