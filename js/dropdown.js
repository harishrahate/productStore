// Dropdown menu functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get all dropdown toggles
    const dropdowns = document.querySelectorAll('.dropdown');
    
    // Add click event for mobile devices
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (toggle && menu) {
            // For mobile: toggle on click
            toggle.addEventListener('click', function(e) {
                // Only handle click on mobile devices
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                }
            });
            
            // For desktop: show on hover
            dropdown.addEventListener('mouseenter', function() {
                if (window.innerWidth > 768) {
                    menu.style.display = 'block';
                }
            });
            
            dropdown.addEventListener('mouseleave', function() {
                if (window.innerWidth > 768) {
                    menu.style.display = 'none';
                }
            });
        }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.style.display = 'none';
            });
        }
    });
});