//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function - always keep navbar shrunk
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        // Always keep navbar shrunk
        navbarCollapsible.classList.add('navbar-shrink');
    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Activate Bootstrap scrollspy on the subnav element (for case study pages)
    const subNav = document.body.querySelector('#subNav');
    if (subNav) {
        const navLinks = subNav.querySelectorAll('.nav-link');
        
        // Dynamically get all section IDs from the nav links
        const sectionIds = [];
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                sectionIds.push(href.substring(1));
            }
        });
        
        // Get all sections that match the nav links
        const sections = sectionIds.length > 0 ? document.querySelectorAll(sectionIds.map(id => '#' + id).join(', ')) : [];
        
        // Calculate offset for navbar + subnav
        const mainNav = document.body.querySelector('#mainNav');
        const mainNavHeight = mainNav ? mainNav.offsetHeight : 0;
        const subNavHeight = subNav.offsetHeight;
        const offset = mainNavHeight + subNavHeight + 50; // Extra padding
        
        let currentActiveSection = null;
        let scrollTimeout = null;
        
        function getCurrentSection() {
            const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            const triggerPoint = scrollY + offset;
            
            let detectedSection = '';
            let minDistance = Infinity;
            
            // Find the section closest to the trigger point
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const sectionTop = rect.top + scrollY;
                const sectionBottom = sectionTop + rect.height;
                
                // Check if section is in viewport or just above it
                if (triggerPoint >= sectionTop - 150 && triggerPoint <= sectionBottom + 150) {
                    const distance = Math.abs(triggerPoint - sectionTop);
                    if (distance < minDistance) {
                        minDistance = distance;
                        detectedSection = section.getAttribute('id');
                    }
                }
            });
            
            // If no section found, check if we're at the top or past the last section
            if (!detectedSection && sections.length > 0) {
                if (scrollY < 100) {
                    // At the top, select first section
                    detectedSection = sections[0].getAttribute('id');
                } else {
                    // Past all sections, select last section
                    const lastSection = sections[sections.length - 1];
                    const lastSectionTop = lastSection.getBoundingClientRect().top + scrollY;
                    if (scrollY >= lastSectionTop - offset) {
                        detectedSection = lastSection.getAttribute('id');
                    }
                }
            }
            
            return detectedSection;
        }
        
        function updateActiveSection(forceSection = null) {
            const targetSection = forceSection || getCurrentSection();
            
            if (!targetSection) {
                return;
            }
            
            // Update current active section
            currentActiveSection = targetSection;
            
            // Update active class on all links
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href === '#' + targetSection) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
        
        // Handle click on nav links - set active immediately and keep it
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const targetId = href.substring(1);
                    
                    // Set as current active section immediately
                    currentActiveSection = targetId;
                    
                    // Remove active from all links
                    navLinks.forEach(l => l.classList.remove('active'));
                    
                    // Add active to clicked link immediately
                    this.classList.add('active');
                    
                    // After scroll settles, update based on actual position
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(function() {
                        const actualSection = getCurrentSection();
                        // Only update if we've actually scrolled to a different section
                        if (actualSection && actualSection !== targetId) {
                            updateActiveSection(actualSection);
                        } else {
                            // Keep the clicked section active
                            updateActiveSection(targetId);
                        }
                    }, 800); // Wait for scroll animation to complete
                }
            });
        });
        
        // Throttled scroll handler - update active section based on scroll position
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    const detectedSection = getCurrentSection();
                    // Update if we detect a different section
                    if (detectedSection) {
                        updateActiveSection(detectedSection);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
        
        // Initial update
        updateActiveSection();
        
        // Also update on resize in case layout changes
        window.addEventListener('resize', function() {
            updateActiveSection();
        }, { passive: true });
    };

    // Collapse responsive navbar when nav links are clicked (standard Bootstrap behavior)
    // Exclude dropdown toggles - they should open dropdowns, not close the navbar
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link:not(.dropdown-toggle)')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });
    
    // Close navbar when dropdown items are clicked (standard Bootstrap behavior)
    const dropdownItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .dropdown-item')
    );
    dropdownItems.map(function (dropdownItem) {
        dropdownItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });
    
    // Handle dropdown toggle - use collapse in mobile, dropdown in desktop
    const dropdownToggles = [].slice.call(
        document.querySelectorAll('#navbarResponsive .dropdown-toggle')
    );
    
    // Disable Bootstrap dropdown in mobile view
    function checkMobileAndDisableBootstrap() {
        const isMobile = window.getComputedStyle(navbarToggler).display !== 'none';
        dropdownToggles.forEach(function (dropdownToggle) {
            if (isMobile) {
                // Remove Bootstrap dropdown data attribute in mobile
                dropdownToggle.removeAttribute('data-bs-toggle');
            } else {
                // Restore Bootstrap dropdown data attribute in desktop
                dropdownToggle.setAttribute('data-bs-toggle', 'dropdown');
            }
        });
    }
    
    // Check on load and resize
    checkMobileAndDisableBootstrap();
    window.addEventListener('resize', checkMobileAndDisableBootstrap);
    
    dropdownToggles.map(function (dropdownToggle) {
        // Use capture phase to run before Bootstrap's handlers
        dropdownToggle.addEventListener('click', (e) => {
            const isMobile = window.getComputedStyle(navbarToggler).display !== 'none';
            
            if (isMobile) {
                // Mobile: prevent Bootstrap dropdown, manually toggle submenu
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                // Find dropdown menu - try next sibling first, then parent's next child
                let dropdownMenu = dropdownToggle.nextElementSibling;
                if (!dropdownMenu || !dropdownMenu.classList.contains('dropdown-menu')) {
                    const parent = dropdownToggle.closest('.dropdown');
                    if (parent) {
                        dropdownMenu = parent.querySelector('.dropdown-menu');
                    }
                }
                
                if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
                    const isExpanded = dropdownToggle.getAttribute('aria-expanded') === 'true';
                    
                    // Remove show class from all other dropdowns first
                    document.querySelectorAll('#navbarResponsive .dropdown-menu.show').forEach(menu => {
                        if (menu !== dropdownMenu) {
                            menu.classList.remove('show');
                        }
                    });
                    
                    if (isExpanded) {
                        dropdownMenu.classList.remove('show');
                        dropdownToggle.setAttribute('aria-expanded', 'false');
                    } else {
                        dropdownMenu.classList.add('show');
                        dropdownToggle.setAttribute('aria-expanded', 'true');
                    }
                }
                return false;
            } else {
                // Desktop: let Bootstrap handle dropdown normally
                e.stopPropagation();
            }
        }, true); // Use capture phase
    });

    // Scroll-triggered reveals
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    // Optionally stop observing after reveal
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    }

});
