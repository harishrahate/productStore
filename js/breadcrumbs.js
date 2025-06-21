// Breadcrumb navigation
function createBreadcrumb(items) {
    const breadcrumbContainer = document.getElementById('breadcrumb');
    if (!breadcrumbContainer) return;
    
    const breadcrumbHTML = items.map((item, index) => {
        if (index === items.length - 1) {
            return `<span class="breadcrumb-current">${item.text}</span>`;
        }
        return `<a href="${item.url}" class="breadcrumb-link">${item.text}</a>`;
    }).join(' <span class="breadcrumb-separator">></span> ');
    
    breadcrumbContainer.innerHTML = breadcrumbHTML;
}