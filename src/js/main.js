/**
 * Main Application
 * Initializes all modules when the page loads
 */

// Local Storage Keys
const STORAGE_KEYS = {
    ASSESSMENT_RESULTS: 'fda_assessment_results',
    USER_BIASES: 'fda_user_biases',
    COMPLETED_ASSESSMENT: 'fda_completed_assessment',
    LAST_VISIT: 'fda_last_visit',
    PERSONALITY_TYPE: 'fda_personality_type',
    FEEDBACK_SUBMITTED: 'fda_feedback_submitted'
};

// URL Parameter Keys
const URL_PARAMS = {
    RESULTS: 'results',
    SOURCE: 'source'  // To track where the share came from
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Financial Personality Assessment initializing...');
    
    // Scroll to top on page load/refresh
    window.scrollTo(0, 0);
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Make sure navigation is visible on desktop
    handleResponsiveNavigation();
    
    // Initialize application router
    initRouter();
    
    // Initialize assessment module
    if (typeof initAssessment === 'function') {
        initAssessment();
        console.log('Assessment module initialized');
    }
    
    // Initialize contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Initialize share button
    const shareButton = document.getElementById('shareButton');
    if (shareButton) {
        shareButton.addEventListener('click', handleShare);
    }
    
    // Initialize export button
    const exportButton = document.getElementById('export-results');
    if (exportButton) {
        exportButton.addEventListener('click', exportResultsToPDF);
    }
    
    // Initialize feedback form
    initFeedbackForm();
    
    // Check for URL parameters with shared results
    checkUrlForSharedResults();
    
    // Check for returning user and restore data
    checkForReturningUser();
    
    // Track current visit
    saveToLocalStorage(STORAGE_KEYS.LAST_VISIT, new Date().toISOString());
    trackEngagement('app_loaded');
    
    // If no hash in URL, make sure we're showing the home section
    if (!window.location.hash) {
        console.log('No hash in URL, showing home section');
        showHomeSection();
    }
    
    console.log('Financial Personality Assessment initialized successfully!');
    
    // Animate the counters for social proof
    animateCounters();
});

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
    // Get DOM elements
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const desktopNav = document.querySelector('nav');
    const desktopResultsLink = document.getElementById('my-results-link');
    const mobileResultsLink = document.getElementById('mobile-results-link');
    
    // Function to close mobile menu
    window.closeMobileMenu = function() {
        if (mobileMenu) {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('open');
            console.log('Mobile menu closed');
        }
    };
    
    // Toggle mobile menu when button is clicked
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('open');
        });
    }
    
    // Close mobile menu when a link is clicked
    if (mobileMenu) {
        const mobileMenuLinks = mobileMenu.querySelectorAll('a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Close immediately without delay
                window.closeMobileMenu();
            });
        });
    }
    
    // Also add click handler to the site title to ensure menu closes
    const siteTitle = document.querySelector('h1 a');
    if (siteTitle) {
        siteTitle.addEventListener('click', () => {
            window.closeMobileMenu();
        });
    }
    
    // Add a global event listener for hash changes to close the mobile menu
    window.addEventListener('hashchange', () => {
        window.closeMobileMenu();
    });
    
    // Add a document click listener to close the menu when clicking anywhere else
    document.addEventListener('click', (e) => {
        // If menu is open and the click is outside the menu and not on the menu button
        if (mobileMenu && 
            !mobileMenu.classList.contains('hidden') && 
            !mobileMenu.contains(e.target) && 
            mobileMenuButton && 
            !mobileMenuButton.contains(e.target)) {
            window.closeMobileMenu();
        }
    });
    
    // Sync "My Results" visibility
    if (desktopResultsLink && mobileResultsLink) {
        // Check if user has completed the assessment
        const hasResults = getFromLocalStorage(STORAGE_KEYS.COMPLETED_ASSESSMENT);
        if (hasResults) {
            desktopResultsLink.classList.remove('hidden');
            mobileResultsLink.classList.remove('hidden');
        }
    }
    
    // Handle window resize to ensure proper menu state
    if (mobileMenu) {
        window.addEventListener('resize', () => {
            // Handle mobile menu visibility on resize
            if (window.innerWidth >= 768) {
                // On desktop: hide mobile menu
                window.closeMobileMenu();
                
                // Ensure desktop nav is visible (in case user switched from mobile)
                if (desktopNav) {
                    desktopNav.classList.remove('hidden');
                    desktopNav.classList.add('md:block');
                }
            } else {
                // On mobile: ensure desktop nav has correct classes
                if (desktopNav) {
                    desktopNav.classList.add('hidden');
                    desktopNav.classList.add('md:block');
                }
            }
        });
    }
    
    // Initial check on page load
    if (window.innerWidth >= 768) {
        // On desktop: ensure desktop nav is visible
        if (desktopNav) {
            desktopNav.classList.remove('hidden');
            desktopNav.classList.add('md:block');
        }
    }
}

/**
 * Update the visibility of results links in both desktop and mobile menus
 * @param {boolean} show - Whether to show or hide the results links
 */
function updateResultsLinksVisibility(show = true) {
    const desktopResultsLink = document.getElementById('my-results-link');
    const mobileResultsLink = document.getElementById('mobile-results-link');
    
    if (desktopResultsLink) {
        if (show) {
            desktopResultsLink.classList.remove('hidden');
        } else {
            desktopResultsLink.classList.add('hidden');
        }
    }
    
    if (mobileResultsLink) {
        if (show) {
            mobileResultsLink.classList.remove('hidden');
        } else {
            mobileResultsLink.classList.add('hidden');
        }
    }
}

// Application Router
function initRouter() {
    console.log('Initializing router');
    
    // Define routes and their handlers
    const routes = {
        '': showHomeSection,  // Default route (empty hash)
        'home': showHomeSection,
        'assessment': showAssessmentSection,
        'results': showResultsSection,
        'about': showAboutSection,
        'contact': showContactSection,
        'faq': showFAQSection
    };
    
    // Initial route handling on page load with a small delay to ensure DOM is ready
    setTimeout(() => {
        handleRouteChange();
        console.log('Initial route handled');
    }, 100);
    
    // Listen for hash changes
    window.addEventListener('hashchange', function(e) {
        console.log('Hash changed from:', e.oldURL, 'to:', e.newURL);
        handleRouteChange();
    });
    
    // Handle route changes
    function handleRouteChange() {
        let hash = window.location.hash.replace('#', '');
        console.log('Route change detected to:', hash);
        
        // Close mobile menu on route change
        if (typeof window.closeMobileMenu === 'function') {
            window.closeMobileMenu();
        }
        
        // If hash is empty, default to home
        if (!hash) hash = 'home';
        
        // Always handle the route change, even if it's the same route
        // This ensures the menu closes properly on same-section clicks
        try {
            // If we have a handler for this route, call it
            if (routes[hash]) {
                console.log('Executing route handler for:', hash);
                routes[hash]();
            } else {
                // Default to home for unknown routes
                console.log('Unknown route, defaulting to home');
                showHomeSection();
            }
            
            // Update visibility of elements based on assessment completion
            if (typeof updateVisibleElements === 'function') {
                updateVisibleElements();
            }
            
            // Update the active navigation item
            updateActiveNavigation(hash);
        } catch (error) {
            console.error('Error handling route change:', error);
            // Fallback to home on error
            showHomeSection();
        }
    }
    
    // Update all navigation links to use hash navigation
    updateNavigationLinks();
    
    // Function to update navigation links
    function updateNavigationLinks() {
        console.log('Updating navigation links');
        
        // Update all navigation links
        const navLinks = document.querySelectorAll('nav a, .hero-cta, #hero-start-assessment, a[href^="#"]');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Skip processing if no href attribute
            if (!href) return;
            
            // Skip links that already have hash navigation or external links
            if (href.startsWith('#') || href.startsWith('http')) {
                console.log(`Link already has hash or is external: ${href}`);
                return;
            }
            
            // Convert regular links to hash navigation
            if (href === '/') {
                link.setAttribute('href', '#home');
                console.log('Root link updated to #home');
            } else {
                // Remove leading slash if present and add hash
                const sectionId = href.replace(/^\//, '');
                link.setAttribute('href', `#${sectionId}`);
                console.log(`Link updated: ${href} -> #${sectionId}`);
            }
        });
        
        // Add event listeners to Start Assessment buttons
        const startAssessmentButtons = document.querySelectorAll('.hero-cta, #hero-start-assessment, .start-assessment-btn, a[href="#assessment"]');
        console.log('Found Start Assessment buttons:', startAssessmentButtons.length);
        
        startAssessmentButtons.forEach(button => {
            // Remove existing event listeners first (to prevent duplicates)
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            newButton.addEventListener('click', (e) => {
                console.log('Start Assessment button clicked');
                e.preventDefault();
                navigateTo('assessment');
            });
        });
        
        // Add event listener for Home button
        const homeLinks = document.querySelectorAll('a[href="#home"], a[href="#"]');
        homeLinks.forEach(link => {
            // Remove existing event listeners first
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            
            newLink.addEventListener('click', (e) => {
                console.log('Home link clicked');
                e.preventDefault();
                navigateTo('home');
            });
        });
        
        // Add event listener for My Results link
        const myResultsLink = document.getElementById('my-results-link');
        if (myResultsLink) {
            // Remove existing event listeners first
            const newLink = myResultsLink.cloneNode(true);
            myResultsLink.parentNode.replaceChild(newLink, myResultsLink);
            
            newLink.addEventListener('click', (e) => {
                console.log('My Results link clicked');
                e.preventDefault();
                showSavedResults();
            });
        }
    }
}

// Navigation helper function
function navigateTo(route) {
    console.log('🚀 Navigation triggered to:', route);
    console.trace('navigateTo call stack:');
    
    // Special case for showing saved results
    if (route === 'showResults') {
        console.log('Special case: showing saved results');
        displaySavedResults();
        return;
    }
    
    // Normal navigation via hash change
    window.location.hash = route;
}

// Route handlers
function showHomeSection() {
    console.log('Showing home section');
    
    // Hide all sections first
    hideAllSections();
    
    // Show hero section using its ID
    const heroSection = document.getElementById('hero-section');
    if (heroSection) {
        heroSection.classList.remove('hidden');
        heroSection.style.display = 'block';
        console.log('Hero section shown');
    } else {
        console.warn('Hero section not found');
    }
    
    // Show social proof section using its ID
    const socialProofSection = document.getElementById('social-proof-section');
    if (socialProofSection) {
        socialProofSection.classList.remove('hidden');
        socialProofSection.style.display = 'block';
        console.log('Social proof section shown');
    } else {
        console.warn('Social proof section not found');
    }
    
    // Show the welcome back panel only for returning users
    const welcomeBack = document.getElementById('welcome-back');
    const completedAssessment = localStorage.getItem('fda_completed_assessment');
    
    if (welcomeBack && completedAssessment === 'true') {
        welcomeBack.classList.remove('hidden');
        welcomeBack.style.display = 'block';
        console.log('Welcome back panel shown for returning user');
    } else if (welcomeBack) {
        welcomeBack.classList.add('hidden');
        welcomeBack.style.display = 'none';
        console.log('Welcome back panel hidden for new user');
    }
    
    // Run animations for counters if they exist
    if (typeof animateCounters === 'function') {
        animateCounters();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update active navigation
    updateActiveNavigation('home');
}

function showAssessmentSection() {
    console.log('🚀 showAssessmentSection called, timestamp:', new Date().toISOString());
    console.log('Showing assessment section');
    
    try {
        // First make sure we really hide ALL other sections
        hideAllSections();
        
        // Extra check to hide ALL homepage content sections
        const heroSection = document.querySelector('.hero-bg');
        if (heroSection) {
            const heroContainer = heroSection.closest('section');
            if (heroContainer) {
                heroContainer.classList.add('hidden');
                heroContainer.style.display = 'none';
                console.log('Hero section explicitly hidden for assessment');
            }
        }
        
        // Make sure the social proof section is hidden
        const socialSection = document.querySelector('.py-10.bg-gradient-to-r.from-blue-50');
        if (socialSection) {
            socialSection.classList.add('hidden');
            socialSection.style.display = 'none';
            console.log('Social proof section explicitly hidden for assessment');
        }
        
        // Double check that welcome back is hidden
        const welcomeBackSection = document.getElementById('welcome-back');
        if (welcomeBackSection) {
            welcomeBackSection.classList.add('hidden');
            welcomeBackSection.style.display = 'none';
            console.log('Welcome back panel explicitly hidden for assessment');
        }
        
        // Show ONLY the assessment section
        const assessmentSection = document.getElementById('assessment-section');
        if (assessmentSection) {
            // Make sure the assessment section is visible
            assessmentSection.classList.remove('hidden');
            assessmentSection.style.display = 'block';
            console.log('Assessment section shown');
            
            // Make sure the question container is visible
            const questionContainer = document.getElementById('question-container');
            if (questionContainer) {
                questionContainer.classList.remove('hidden');
                questionContainer.style.display = 'block';
                console.log('Question container shown');
            } else {
                console.error('Question container not found, element ID might be incorrect');
            }
            
            // Start the assessment if the function exists
            if (typeof startAssessment === 'function') {
                console.log('Calling startAssessment function...');
                startAssessment();
                console.log('Assessment started');
            } else {
                console.error('startAssessment function not found. Ensure assessment.js is loaded before main.js');
            }
        } else {
            console.error('Assessment section element not found! Check the HTML for element with id="assessment-section"');
        }
        
        // Update the active navigation
        updateActiveNavigation('assessment');
    } catch (error) {
        console.error('Error in showAssessmentSection:', error);
    }
}

function showResultsSection() {
    console.log('Showing results section');
    
    // Hide all sections
    hideAllSections();
    
    // Hide welcome back message
    const welcomeBack = document.getElementById('welcome-back');
    if (welcomeBack) {
        welcomeBack.classList.add('hidden');
        console.log('Welcome back panel hidden for results');
    }
    
    // Get saved biases and check if assessment was completed
    const savedBiases = getFromLocalStorage(STORAGE_KEYS.USER_BIASES);
    
    // Check if we have results to display
    if (savedBiases) {
        console.log('Found saved biases, displaying results');
        
        // Show results section
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            resultsSection.classList.remove('hidden');
            resultsSection.style.display = 'block';
            console.log('Results section shown');
            
            // Update active navigation
            updateActiveNavigation('results');
            
            // Get the header height to use as offset
            const headerHeight = document.querySelector('header')?.offsetHeight || 80;
            
            // Scroll to Results section with proper offset for fixed header
            window.scrollTo({
                top: resultsSection.offsetTop - headerHeight - 20, // Extra 20px padding
                behavior: 'smooth'
            });
            
            // Track this view
            trackEngagement('view_results');
            
            // Display results if the function exists
            if (typeof displayResults === 'function') {
                try {
                    displayResults(savedBiases);
                } catch (error) {
                    console.error('Error displaying results:', error);
                }
            }
            
            // Initialize feedback form
            if (typeof initFeedbackForm === 'function') {
                initFeedbackForm();
            }
        }
    } else {
        console.log('No saved results, redirecting to assessment section');
        showAssessmentSection();
    }
}

function showAboutSection() {
    console.log('Showing about section');
    
    // Hide all sections first
    hideAllSections();
    
    // Only show About section, not Contact or Hero
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        aboutSection.classList.remove('hidden');
        aboutSection.style.display = 'block';
        console.log('About section shown');
        
        // Ensure Welcome Back is hidden
        const welcomeBackSection = document.getElementById('welcome-back');
        if (welcomeBackSection) {
            welcomeBackSection.classList.add('hidden');
            welcomeBackSection.style.display = 'none';
        }
        
        // Get the header height to use as offset
        const headerHeight = document.querySelector('header')?.offsetHeight || 80;
        
        // Scroll to About section with proper offset for fixed header
        window.scrollTo({
            top: aboutSection.offsetTop - headerHeight - 20, // Extra 20px padding
            behavior: 'smooth'
        });
        
        // Update active navigation
        updateActiveNavigation('about');
    } else {
        console.error('About section not found');
    }
}

function showContactSection() {
    console.log('Showing contact section');
    
    // Hide all sections first
    hideAllSections();
    
    // Only show Contact section, not About or Hero
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.classList.remove('hidden');
        contactSection.style.display = 'block';
        console.log('Contact section shown');
        
        // Ensure Welcome Back is hidden
        const welcomeBackSection = document.getElementById('welcome-back');
        if (welcomeBackSection) {
            welcomeBackSection.classList.add('hidden');
            welcomeBackSection.style.display = 'none'; 
        }
        
        // Get the header height to use as offset
        const headerHeight = document.querySelector('header')?.offsetHeight || 80;
        
        // Scroll to Contact section with proper offset for fixed header
        window.scrollTo({
            top: contactSection.offsetTop - headerHeight - 20, // Extra 20px padding
            behavior: 'smooth'
        });
        
        // Update active navigation
        updateActiveNavigation('contact');
    } else {
        console.error('Contact section not found');
    }
}

// Add FAQ section handler
function showFAQSection() {
    console.log('Showing FAQ section');
    
    // Hide all sections first
    hideAllSections();
    
    // Show the FAQ section
    const faqSection = document.getElementById('faq');
    if (faqSection) {
        faqSection.classList.remove('hidden');
        faqSection.style.display = 'block';
        console.log('FAQ section shown');
        
        // Ensure Welcome Back is hidden
        const welcomeBackSection = document.getElementById('welcome-back');
        if (welcomeBackSection) {
            welcomeBackSection.classList.add('hidden');
            welcomeBackSection.style.display = 'none';
        }
        
        // Get the header height to use as offset
        const headerHeight = document.querySelector('header')?.offsetHeight || 80;
        
        // Scroll to FAQ section with proper offset for fixed header
        window.scrollTo({
            top: faqSection.offsetTop - headerHeight - 20, // Extra 20px padding
            behavior: 'smooth'
        });
        
        // Update active navigation
        updateActiveNavigation('faq');
    } else {
        console.error('FAQ section not found');
    }
}

// Helper function to hide all sections
function hideAllSections() {
    console.log('Hiding all sections');
    
    // Get all major sections by ID
    const sections = [
        document.getElementById('assessment-section'),
        document.getElementById('results-section'),
        document.getElementById('about'),
        document.getElementById('faq'),
        document.getElementById('contact'),
        document.getElementById('welcome-back'),
        document.getElementById('hero-section'),
        document.getElementById('social-proof-section')
    ];
    
    // Hide all sections found
    sections.forEach(section => {
        if (section) {
            section.classList.add('hidden');
            section.style.display = 'none';
            console.log(`Hidden section: ${section.id}`);
        }
    });
    
    // Also hide all other top-level sections that might not have IDs
    const homeContentSections = document.querySelectorAll('main > section:not(#assessment-section):not(#results-section):not(#about):not(#faq):not(#contact):not(#hero-section):not(#social-proof-section)');
    homeContentSections.forEach(section => {
        if (section) {
            section.classList.add('hidden');
            section.style.display = 'none';
            console.log(`Hidden section without ID: ${section.className}`);
        }
    });
}

// Check if the URL contains shared results
function checkUrlForSharedResults() {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedResults = urlParams.get(URL_PARAMS.RESULTS);
    const shareSource = urlParams.get(URL_PARAMS.SOURCE);
    
    if (sharedResults) {
        try {
            // Decode and parse results
            const decodedResults = decodeURIComponent(sharedResults);
            const biasResults = JSON.parse(atob(decodedResults));
            
            // Track where the share came from
            if (shareSource) {
                trackEngagement('shared_results_viewed', { source: shareSource });
            } else {
                trackEngagement('shared_results_viewed', { source: 'unknown' });
            }
            
            // Store in localStorage
            saveToLocalStorage(STORAGE_KEYS.USER_BIASES, biasResults);
            saveToLocalStorage(STORAGE_KEYS.COMPLETED_ASSESSMENT, true);
            
            // Update results links visibility
            updateResultsLinksVisibility(true);
            
            // Show shared results banner
            showSharedResultsBanner();
            
            // Display the results
            setTimeout(() => {
                if (typeof displayResults === 'function') {
                    // If assessment module is loaded, use its display function
                    displayResults(biasResults);
                } else {
                    // Otherwise, display using our own method
                    displaySharedResults(biasResults);
                }
            }, 1000);
        } catch (error) {
            console.error('Error parsing shared results:', error);
        }
    }
}

// Display a banner indicating results were shared with the user
function showSharedResultsBanner() {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;
    
    const banner = document.createElement('div');
    banner.className = 'w-full bg-indigo-100 border-l-4 border-indigo-500 text-indigo-700 p-4 mb-6 rounded slide-in-up';
    banner.innerHTML = `
        <div class="flex items-center">
            <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium">
                    Someone shared their financial personality assessment results with you! You can take your own assessment to compare, or explore the insights below.
                </p>
            </div>
            <div class="ml-auto pl-3">
                <div class="-mx-1.5 -my-1.5">
                    <button class="close-banner inline-flex bg-indigo-100 p-1.5 text-indigo-500 rounded-md hover:bg-indigo-200 focus:outline-none">
                        <span class="sr-only">Dismiss</span>
                        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Insert banner at the beginning of main content
    mainContent.insertBefore(banner, mainContent.firstChild);
    
    // Add event listener to close button
    banner.querySelector('.close-banner').addEventListener('click', () => {
        banner.remove();
    });
}

// Display shared results if assessment module isn't available
function displaySharedResults(biasResults) {
    // Show results section
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Hide other sections
    const assessmentSection = document.getElementById('assessment-section');
    if (assessmentSection) {
        assessmentSection.classList.add('hidden');
    }
    
    // Display results using our fallback display function
    const biasResultsContainer = document.getElementById('bias-results');
    const debiasingStrategiesContainer = document.getElementById('debiasing-strategies');
    
    if (biasResultsContainer && biasResults) {
        biasResultsContainer.innerHTML = `
            <p class="text-center text-gray-600 mb-6">
                Shared financial personality assessment results:
            </p>
            <div class="space-y-6">
        `;
        
        // Create bias result cards
        biasResults.forEach(bias => {
            let severityClass = 'low';
            let severityText = 'Mild';
            
            if (bias.score >= 8) {
                severityClass = 'high';
                severityText = 'Strong';
            } else if (bias.score >= 5) {
                severityClass = 'medium';
                severityText = 'Moderate';
            }
            
            const biasCard = document.createElement('div');
            biasCard.className = `bias-card ${severityClass}`;
            biasCard.innerHTML = `
                <h4 class="font-bold text-lg">${bias.name}</h4>
                <p class="text-gray-700">${bias.description}</p>
                <div class="mt-2">
                    <span class="text-sm font-medium">Trait Strength: ${severityText} (${bias.score}/10)</span>
                    <div class="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                        <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${bias.score * 10}%"></div>
                    </div>
                </div>
            `;
            
            biasResultsContainer.appendChild(biasCard);
        });
        
        biasResultsContainer.innerHTML += `</div>`;
    }
    
    // Display debiasing strategies
    if (debiasingStrategiesContainer && biasResults) {
        debiasingStrategiesContainer.innerHTML = '';
        
        // Get top 3 biases
        const topBiases = biasResults.slice(0, 3);
        
        // Create strategy cards
        topBiases.forEach(bias => {
            const strategyCard = document.createElement('div');
            strategyCard.className = 'strategy-card';
            
            // Create list of strategies
            const strategiesList = bias.strategies ? 
                bias.strategies.map(strategy => `<li>${strategy}</li>`).join('') :
                '<li>Learn more about this personality type and how it affects financial decisions.</li>';
            
            strategyCard.innerHTML = `
                <h5 class="font-bold">For ${bias.name}:</h5>
                <ul class="list-disc pl-5 mt-2">
                    ${strategiesList}
                </ul>
            `;
            
            debiasingStrategiesContainer.appendChild(strategyCard);
        });
        
        // Add "Take your own assessment" button
        const takeAssessmentButton = document.createElement('div');
        takeAssessmentButton.className = 'mt-6 text-center';
        takeAssessmentButton.innerHTML = `
            <button id="take-own-assessment" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg text-lg shadow-lg transition duration-300">
                Take Your Own Assessment
            </button>
        `;
        
        debiasingStrategiesContainer.appendChild(takeAssessmentButton);
        
        // Add event listener to button
        setTimeout(() => {
            const button = document.getElementById('take-own-assessment');
            if (button) {
                button.addEventListener('click', () => {
                    navigateTo('assessment');
                });
            }
        }, 100);
    }
}

// Check if user is returning and has previous results
function checkForReturningUser() {
    const completedAssessment = getFromLocalStorage(STORAGE_KEYS.COMPLETED_ASSESSMENT);
    const lastVisit = getFromLocalStorage(STORAGE_KEYS.LAST_VISIT);
    const savedBiases = getFromLocalStorage(STORAGE_KEYS.USER_BIASES);
    
    console.log('Checking for returning user:');
    console.log('- Completed assessment:', completedAssessment);
    console.log('- Last visit:', lastVisit);
    console.log('- Saved biases:', savedBiases ? 'Present' : 'None');
    
    // If user has completed assessment
    if (completedAssessment === 'true' && savedBiases) {
        // Show the "My Results" link in navigation
        const myResultsLink = document.getElementById('my-results-link');
        if (myResultsLink) {
            myResultsLink.classList.remove('hidden');
        }
        
        // Only show welcome back if we're on the home page (no hash)
        if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#home') {
            // Show welcome back panel
            const welcomeBackPanel = document.getElementById('welcome-back');
            if (welcomeBackPanel) {
                welcomeBackPanel.classList.remove('hidden');
                welcomeBackPanel.style.display = 'block';
                
                console.log('Welcome back panel shown for returning user');
            }
        }
    } else {
        // Hide welcome back panel
        const welcomeBackPanel = document.getElementById('welcome-back');
        if (welcomeBackPanel) {
            welcomeBackPanel.classList.add('hidden');
            welcomeBackPanel.style.display = 'none';
            
            console.log('Welcome back panel hidden for new user');
        }
    }
}

// Display saved results
function displaySavedResults() {
    console.log('Displaying saved results');
    
    try {
        // Hide all sections
        hideAllSections();
        
        // Get saved results
        const savedResults = getFromLocalStorage('fda_results');
        
        if (savedResults) {
            console.log('Found saved results');
            
            // Show results section
            const resultsSection = document.getElementById('results-section');
            if (resultsSection) {
                resultsSection.classList.remove('hidden');
                resultsSection.style.display = 'block';
                console.log('Results section shown');
                
                // Update navigation
                window.location.hash = 'results';
                updateActiveNavigation('results');
                
                // Display the results
                const parsedResults = JSON.parse(savedResults);
                if (typeof displayResults === 'function') {
                    displayResults(parsedResults);
                    console.log('Results displayed successfully');
                } else {
                    console.error('displayResults function not available');
                }
                
                // Initialize feedback form
                if (typeof initFeedbackForm === 'function') {
                    initFeedbackForm();
                }
            } else {
                console.error('Results section not found');
            }
        } else {
            console.log('No saved results found, taking user to assessment');
            navigateTo('assessment');
            showNotification('No saved results found. Please take the assessment first.', 'info');
        }
    } catch (error) {
        console.error('Error displaying saved results:', error);
        showNotification('There was an error loading your results. Please try again.', 'error');
        navigateTo('home');
    }
}

// Update active navigation link
function updateActiveNavigation(activeRoute) {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        if (href === '#' + activeRoute || href === activeRoute) {
            link.classList.add('text-white', 'font-semibold');
        } else {
            link.classList.remove('text-white', 'font-semibold');
        }
    });
}

// Contact form submission handler
function handleContactSubmit(e) {
    e.preventDefault();
    
    // Get the form and submission button
    const form = e.target;
    const submitButton = document.getElementById('contact-submit-btn');
    
    // Disable the submit button and show loading state
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = 'Sending...';
        submitButton.classList.add('opacity-70');
    }
    
    // Get form data
    const name = document.getElementById('user_name').value.trim();
    const email = document.getElementById('user_email').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // Log the values to ensure they're being captured
    console.log('Form data captured:', {
        name: name,
        email: email,
        message: message ? 'Message present' : 'No message'
    });
    
    // Prepare template parameters for EmailJS
    const templateParams = {
        to_email: 'paligamingx@gmail.com',
        subject: 'Financial Personality Types - Contact Form',
        user_name: name,
        user_email: email,
        message: message
    };
    
    console.log('Sending contact form to EmailJS');
    
    // Send the email using EmailJS
    emailjs.send(
        // EmailJS service ID
        'service_ej7d6fr', 
        
        // EmailJS template ID
        'template_wbx7t9q', 
        
        templateParams
    )
        .then(function(response) {
            console.log('Email sent successfully!', response.status, response.text);
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'mt-4 p-3 bg-green-100 text-green-700 rounded-md slide-in-up';
            successMessage.innerHTML = `
                <p class="flex items-center">
                    <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Your message has been sent! We'll get back to you soon.
                </p>
            `;
            
            // Insert success message
            if (submitButton && submitButton.parentNode) {
                submitButton.parentNode.insertBefore(successMessage, submitButton);
            } else {
                form.appendChild(successMessage);
            }
            
            // Reset form
            form.reset();
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
            
            // Track form submission
            trackEngagement('contact_form_submit_success');
        })
        .catch(function(error) {
            console.error('Error sending email:', error);
            
            // Show error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'mt-4 p-3 bg-red-100 text-red-700 rounded-md slide-in-up';
            errorMessage.innerHTML = `
                <p class="flex items-center">
                    <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    There was an error sending your message. Please try again later.
                </p>
            `;
            
            // Insert error message
            if (submitButton && submitButton.parentNode) {
                submitButton.parentNode.insertBefore(errorMessage, submitButton);
            } else {
                form.appendChild(errorMessage);
            }
            
            // Hide error message after 5 seconds
            setTimeout(() => {
                errorMessage.remove();
            }, 5000);
            
            // Track form submission error
            trackEngagement('contact_form_submit_error');
        })
        .finally(function() {
            // Re-enable the submit button
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Send Message';
                submitButton.classList.remove('opacity-70');
            }
        });
}

// Handle share button click
function handleShare() {
    console.log('Share button clicked');
    
    // Create share data
    const shareData = {
        title: 'My Financial Personality Assessment',
        text: 'Check out my financial personality assessment results!',
        url: createShareableUrl()
    };
    
    // Try Web Share API first
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => {
                console.log('Shared successfully using Web Share API');
                trackEngagement('share_results', { method: 'web_share_api' });
            })
            .catch(error => {
                console.error('Error sharing via Web Share API:', error);
                
                // Fallback to clipboard
                copyToClipboard(shareData.url);
            });
    } else {
        // Fallback to clipboard for browsers without Web Share API
        copyToClipboard(shareData.url);
    }
}

// Create sharable URL with encoded results
function createShareableUrl() {
    // Get saved results
    const savedBiases = getFromLocalStorage(STORAGE_KEYS.USER_BIASES);
    
    if (!savedBiases) {
        console.error('No saved biases to share');
        return window.location.href;
    }
    
    // Encode results
    const encodedResults = btoa(JSON.stringify(savedBiases));
    
    // Create URL with query parameter
    const url = new URL(window.location.href.split('#')[0]);
    url.searchParams.set(URL_PARAMS.RESULTS, encodedResults);
    url.searchParams.set(URL_PARAMS.SOURCE, 'share_button');
    url.hash = 'results';
    
    return url.toString();
}

// Copy text to clipboard
function copyToClipboard(text) {
    // Create temporary element
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    
    // Select and copy
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    
    // Show success notification
    showNotification('Link copied to clipboard! You can now share it with others.');
    
    // Track sharing
    trackEngagement('share_results', { method: 'clipboard' });
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg slide-in-up ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`;
    notification.innerHTML = `
        <div class="flex items-center">
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${type === 'success' ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'}" />
            </svg>
            <span>${message}</span>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Helper to draw strategy card with enhanced styling
function drawStrategyCard(biasName, strategies, y) {
    const cardMargin = 8;
    const cardWidth = contentWidth;
    let totalHeight = 0;
    
    // Create section heading with blue styling
    const headingColor = colors.primary;
    
    // Draw strategy section title background
    doc.setFillColor(headingColor[0], headingColor[1], headingColor[2], 0.1);
    doc.roundedRect(margin - 2, y - 2, cardWidth + 4, 25, 2, 2, 'F');
    
    // Add accent line at left
    doc.setFillColor(headingColor[0], headingColor[1], headingColor[2]);
    doc.rect(margin - 2, y - 2, 3, 25, 'F');
    
    // Add icon for strategies
    const iconSize = 14;
    doc.setFillColor(headingColor[0], headingColor[1], headingColor[2], 0.1);
    doc.circle(margin + 12, y + 10, iconSize/2, 'F');
    
    // Set text colors
    setFont(fonts.heading3, headingColor);
    
    // Add strategy header with icon
    doc.text(`Strategies for ${biasName}`, margin + 30, y + 10);
    
    // Draw gear icon (simplified)
    doc.setDrawColor(headingColor[0], headingColor[1], headingColor[2]);
    doc.setLineWidth(0.8);
    doc.circle(margin + 12, y + 10, iconSize/4, 'D');
    doc.circle(margin + 12, y + 10, iconSize/8, 'D');
    
    // Move position down after header
    y += 30;
    totalHeight = 30;
    
    // Process each strategy
    strategies.forEach((strategy, index) => {
        const name = strategy.name || 'Strategy';
        const description = strategy.description || strategy;
        
        // Get color for this strategy - alternate between colors
        const strategyColor = index % 2 === 0 ? colors.primary : colors.secondary;
        
        // Calculate content height
        const descLines = doc.splitTextToSize(description, cardWidth - 60);
        const strategyHeight = descLines.length * 6 + 25;
        
        // Draw strategy card with subtle gradient background
        const stratGradient = doc.setGradient("axial",
            margin, y,
            margin, y + strategyHeight,
            [[0, 'FFFFFF'], [1, 'F8FAFC']]
        );
        
        // Draw strategy card
        doc.setFillColor(stratGradient);
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, y, cardWidth, strategyHeight, 2, 2, 'FD');
        
        // Draw number circle
        const circleX = margin + 15;
        const circleY = y + 14;
        const circleSize = 12;
        
        // Gradient for number circle
        const circleGradient = doc.setGradient("radial",
            circleX, circleY, 0,
            circleX, circleY, circleSize,
            [[0, rgbToHex(strategyColor[0], strategyColor[1], strategyColor[2])], 
             [1, getColorWithOpacity(strategyColor, 0.7)]]
        );
        
        doc.setFillColor(circleGradient);
        doc.circle(circleX, circleY, circleSize/2, 'F');
        
        // Add number
        setFont({font: 'helvetica', style: 'bold', size: 10}, colors.white);
        doc.text((index + 1).toString(), circleX, circleY + 1, {align: 'center'});
        
        // Add strategy name with colored rectangle behind it
        const stratNameWidth = doc.getTextWidth(`${name}`);
        
        // Add colored background for strategy name
        doc.setFillColor(strategyColor[0], strategyColor[1], strategyColor[2], 0.1);
        doc.roundedRect(margin + 30, y + 6, stratNameWidth + 16, 16, 8, 8, 'F');
        
        // Add strategy name text
        setFont({font: 'helvetica', style: 'bold', size: 11}, strategyColor);
        doc.text(name, margin + 38, y + 16);
        
        // Add strategy description
        setFont(fonts.body, colors.dark);
        doc.text(descLines, margin + 32, y + 28);
        
        // Add a subtle decorative element
        doc.setDrawColor(strategyColor[0], strategyColor[1], strategyColor[2], 0.3);
        doc.setLineWidth(0.3);
        doc.line(margin + 32, y + 22, margin + cardWidth - 20, y + 22);
        
        // Update position for next strategy
        y += strategyHeight + 10;
        totalHeight += strategyHeight + 10;
    });
    
    // Add final decorative element
    doc.setDrawColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.setLineWidth(0.5);
    doc.setLineDash([1, 1]);
    doc.line(margin + 15, y - 5, margin + cardWidth - 15, y - 5);
    doc.setLineDash([]);
    
    return y + 5; // Return final position with some margin
}

// Function to create a modern, professional cover page
function createCoverPage(doc) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    
    try {
        // Try to create a gradient background if the function is available
        if (typeof doc.setGradient === 'function') {
    // Create a gradient background for header area
    const headerGradient = doc.setGradient("linear", 
        0, 0, pageWidth, 0, 
        [[0, '1E40AF'], [1, '3B82F6']]  // Dark blue to medium blue
    );
    
    // Draw header background with gradient
    doc.setFillColor(headerGradient);
        } else {
            // Fallback to a solid color if gradient is not available
            doc.setFillColor(30, 64, 175); // Dark blue (hex 1E40AF)
        }
    } catch (error) {
        console.log("Gradient not supported, using fallback color");
        // Fallback to a solid color
        doc.setFillColor(30, 64, 175); // Dark blue (hex 1E40AF)
    }
    
    // Draw header background
    doc.rect(0, 0, pageWidth, 70, 'F');
    
    // Add decorative elements - wave pattern at bottom of header
    doc.setFillColor(255, 255, 255, 0.15);
    
    // Draw a simplified wave pattern - fix the linter errors
    let waveX = [];
    let waveY = [];
    for (let x = 0; x < pageWidth; x += 5) {
        const y = 68 + Math.sin(x/10) * 3;
        waveX.push(x);
        waveY.push(y);
    }
    
    // Add the wave base points
    waveX.push(pageWidth, 0);
    waveY.push(70, 70);
    
    // Draw wave polygon
    doc.polygon(waveX, waveY, 'F');
    
    // Add abstract geometric design elements
    doc.setFillColor(255, 255, 255, 0.1);
    
    // Large circle
    doc.circle(pageWidth - 40, 35, 40, 'F');
    
    // Small circles
    doc.circle(30, 20, 8, 'F');
    doc.circle(45, 50, 12, 'F');
    doc.circle(pageWidth - 80, 15, 6, 'F');
    
    // Add financial icon - abstract chart/graph
    doc.setFillColor(255, 255, 255, 0.2);
    doc.roundedRect(25, 30, 30, 20, 3, 3, 'F');
    
    doc.setDrawColor(255, 255, 255, 0.6);
    doc.setLineWidth(1.2);
    
    // Draw growing chart line
    doc.line(30, 45, 35, 40, 42, 43, 50, 35);
    
    // Add logo-like element
    doc.setFillColor(255, 255, 255, 0.9);
    doc.circle(35, 30, 5, 'F');
    
    // Add title with modern typography
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text('Financial Personality', 70, 30);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255, 0.95);
    doc.text('Assessment', 70, 45);
    
    // Add subtle tagline
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255, 0.8);
    doc.text('Understanding Your Financial Decision-Making Patterns', 70, 60);
    
    // Add glossy highlight
    doc.setFillColor(255, 255, 255, 0.1);
    doc.rect(0, 0, pageWidth, 15, 'F');
    
    // Decorative line
    doc.setDrawColor(255, 255, 255, 0.5);
    doc.setLineWidth(0.8);
    doc.line(70, 50, 200, 50);
    
    // Add content below header
    let yPos = 90;
    
    // Add results heading with modern styling
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246);
    doc.text('ASSESSMENT RESULTS', pageWidth / 2, yPos, { align: 'center' });
    
    // Add date section with calendar icon
    yPos += 15;
    const dateString = new Date().toLocaleDateString();
    
    // Create date container
    doc.setFillColor(242, 246, 255); // Very light blue
    doc.roundedRect(pageWidth/2 - 50, yPos - 10, 100, 20, 5, 5, 'F');
    
    // Draw simplified calendar icon
    const calX = pageWidth / 2 - 43;
    const calY = yPos;
    
    doc.setFillColor(59, 130, 246, 0.7);
    doc.roundedRect(calX - 5, calY - 7, 10, 10, 1, 1, 'F');
    
    // Add date text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    doc.text(`Generated on ${dateString}`, pageWidth / 2 + 7, yPos + 1);
    
    // Add separator with gradient
    yPos += 20;
    const separatorGradient = doc.setGradient("linear",
        margin, yPos,
        pageWidth - margin, yPos,
        [[0, 'E5E7EB'], [0.5, '6B7280'], [1, 'E5E7EB']]
    );
    
    doc.setFillColor(separatorGradient);
    doc.rect(margin, yPos, pageWidth - (margin * 2), 0.8, 'F');
    
    // Add introduction paragraph with styled first letter
    yPos += 20;
    const introText = "This personalized assessment analyzes your financial personality and identifies cognitive biases that may affect your decision making. Use these insights to develop more informed strategies and improve your financial outcomes.";
    
    // Create decorative background for intro
    doc.setFillColor(242, 246, 255); // Very light blue
    doc.roundedRect(margin - 5, yPos - 15, pageWidth - (margin * 2) + 10, 60, 5, 5, 'F');
    
    // Add drop cap styling for first letter
    const firstLetter = introText.charAt(0);
    const restOfText = introText.substring(1);
    
    // Draw drop cap
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(36);
    doc.setTextColor(59, 130, 246);
    doc.text(firstLetter, margin + 5, yPos + 5);
    
    // Draw rest of paragraph
    const introLines = doc.splitTextToSize(restOfText, pageWidth - (margin * 2) - 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(70, 70, 70);
    doc.text(introLines, margin + 20, yPos);
    
    // Add decorative corner elements to the intro box
    doc.setDrawColor(59, 130, 246, 0.3);
    doc.setLineWidth(0.5);
    
    // Top-right corner
    const cornerSize = 8;
    doc.line(pageWidth - margin - 5, yPos - 15 + 5, pageWidth - margin - 5, yPos - 15 + 5 + cornerSize);
    doc.line(pageWidth - margin - 5 - cornerSize, yPos - 15 + 5, pageWidth - margin - 5, yPos - 15 + 5);
    
    // Bottom-left corner
    doc.line(margin + 5, yPos + 45 - 5, margin + 5, yPos + 45 - 5 - cornerSize);
    doc.line(margin + 5, yPos + 45 - 5, margin + 5 + cornerSize, yPos + 45 - 5);
    
    // Return the vertical position after the intro section
    return yPos + 50;
}

// Debug logging helper - only logs in development environments
function debugLog(...args) {
    const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    if (isDevelopment) {
        console.log(...args);
    }
}

// Export results to PDF using jsPDF (alternative approach)
function exportResultsToPDF() {
    debugLog('Exporting comprehensive assessment results to PDF');
    
    try {
        // Get necessary data
        const biasData = getFromLocalStorage(STORAGE_KEYS.USER_BIASES);
        const personalityTypeData = getFromLocalStorage(STORAGE_KEYS.PERSONALITY_TYPE);
        
        if (!biasData || !personalityTypeData) {
            console.error('Missing data for PDF export');
            showNotification('Missing assessment data. Please complete the assessment first.', 'error');
            return false;
        }
        
        // Show loading indicator
        showLoadingSpinner('Generating your detailed report...');
        
        // Create jsPDF instance
        let doc;
        try {
            // Create jsPDF with standard features
            doc = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        } catch (error) {
            console.error('Error initializing jsPDF:', error);
            showNotification('There was an error exporting to PDF. Please try again.', 'error');
            hideLoadingSpinner();
            return false;
        }
        
        // Get page dimensions
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        
        // Define colors as hex strings for compatibility
        const colors = {
            primary: '#2563eb',    // Blue
            secondary: '#10b981',  // Teal
            accent: '#f97316',     // Orange
            dark: '#1f2937',       // Dark gray
            light: '#f3f4f6',      // Light gray
            white: '#ffffff'
        };
        
        // Define fonts
        const fonts = {
            heading1: { font: 'helvetica', style: 'bold', size: 22 },
            heading2: { font: 'helvetica', style: 'bold', size: 16 },
            heading3: { font: 'helvetica', style: 'bold', size: 14 },
            subheading: { font: 'helvetica', style: 'bold', size: 12 },
            body: { font: 'helvetica', style: 'normal', size: 10 },
            small: { font: 'helvetica', style: 'normal', size: 8 },
            caption: { font: 'helvetica', style: 'italic', size: 9 }
        };
        
        // Helper function to set font
        function setFont(fontDef, color = colors.dark) {
            doc.setFont(fontDef.font, fontDef.style);
            doc.setFontSize(fontDef.size);
            doc.setTextColor(color);
        }
        
        // Create fancy header
        function createFancyHeader(title) {
            // Draw header background
            doc.setFillColor(colors.primary);
            doc.rect(0, 0, pageWidth, 25, 'F');
            
            // Add decorative element
            doc.setFillColor(colors.accent);
            doc.rect(0, 25, pageWidth, 3, 'F');
            
            // Add title
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.setTextColor(colors.white);
            doc.text(title, pageWidth / 2, 16, { align: 'center' });
            
            return 35; // Return the Y position after the header
        }
        
        // Create section header
        function createSectionHeader(title, yPos) {
            // Add decorative element - use a filled rectangle instead of just a line
            doc.setFillColor(colors.primary);
            doc.roundedRect(margin, yPos - 6, pageWidth - (margin * 2), 18, 2, 2, 'F');
            
            // Add title text
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            doc.setTextColor(colors.white);
            doc.text(title, pageWidth / 2, yPos + 2, { align: 'center' });
            
            return yPos + 16; // Return position after header
        }
        
        // Draw a fancy personality card
        function drawFancyPersonalityCard(name, description, strengths, yPos, color, isSecondary = false) {
            const cardWidth = pageWidth - (margin * 2);
            
            // Calculate heights more accurately with reduced spacing
            const titleHeight = 14; // Reduced title area height
            
            // Split and measure description text
            const descriptionText = doc.splitTextToSize(description, cardWidth - 20);
            const descHeight = descriptionText.length * 5.5;
            
            // Calculate strengths section height
            const strengthsIntroHeight = 8;
            const strengthItemHeight = 6;
            const strengthsHeight = strengths && strengths.length > 0 
                ? strengthsIntroHeight + (strengths.length * strengthItemHeight) 
                : 0;
            
            // Calculate total card height with reduced spacing
            const cardHeight = titleHeight + descHeight + strengthsHeight + 20; // Reduced padding
            
            // Set card colors based on personality type
            let cardColor;
            if (isSecondary) {
                cardColor = '#10b981'; // Green for secondary
            } else {
                cardColor = '#2563eb'; // Blue for primary
            }
            
            // Draw card background with light color
            const bgColor = isSecondary ? '#f0f9f4' : '#f0f5ff';
            doc.setFillColor(bgColor);
            doc.roundedRect(margin, yPos, cardWidth, cardHeight, 2, 2, 'F');
            
            // Draw title bar
            doc.setFillColor(cardColor);
            doc.roundedRect(margin, yPos, cardWidth, titleHeight, 2, 2, 'F');
            
            // Add title
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(colors.white);
            doc.text(name, margin + 8, yPos + 10);
            
            // Add description
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(colors.dark);
            doc.text(descriptionText, margin + 8, yPos + titleHeight + 8);
            
            let currentY = yPos + titleHeight + descHeight + 12;
            
            // Add strengths if available
            if (strengths && strengths.length > 0) {
                // Add strengths heading
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.setTextColor(cardColor);
                doc.text('Key Strengths:', margin + 8, currentY);
                currentY += 8;
                
                // Add strengths as bullet points
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(colors.dark);
                
                strengths.forEach(strength => {
                    // Draw bullet
                    doc.setFillColor(cardColor);
                    doc.circle(margin + 12, currentY - 1.5, 1.2, 'F');
                    
                    // Draw strength text
                    doc.text(strength, margin + 16, currentY);
                    currentY += 6;
                });
            }
            
            return yPos + cardHeight + 8; // Reduced spacing between cards
        }
        
        // Draw a fancy bias card
        function drawFancyBiasCard(name, score, description, effects, yPos) {
            const cardWidth = pageWidth - (margin * 2);
            
            // Split description text to measure height
            const descriptionText = doc.splitTextToSize(description, cardWidth - 20);
            const descHeight = descriptionText.length * 5.5;
            
            // Calculate effects height if present
                        let effectsHeight = 0;
            let effectsText = [];
                        if (effects) {
                effectsText = doc.splitTextToSize(`Impact: ${effects}`, cardWidth - 20);
                effectsHeight = effectsText.length * 5.5 + 6;
            }
            
            // Calculate total card height with reduced spacing
            const titleHeight = 12;
            const cardHeight = titleHeight + descHeight + effectsHeight + 18;
            
            // Determine color based on score
            let scoreColor;
            if (score >= 7) {
                scoreColor = '#ef4444'; // Red for high
            } else if (score >= 4) {
                scoreColor = '#f59e0b'; // Yellow/amber for medium
            } else {
                scoreColor = '#10b981'; // Green for low
            }
            
            // Draw card background (light color based on score)
            const bgColor = score >= 7 ? '#fef2f2' : (score >= 4 ? '#fffbeb' : '#ecfdf5');
            doc.setFillColor(bgColor);
            doc.roundedRect(margin, yPos, cardWidth, cardHeight, 2, 2, 'F');
            
            // Draw title section
            doc.setFillColor(scoreColor);
            doc.roundedRect(margin, yPos, cardWidth, titleHeight, 2, 2, 'F');
            
            // Add title
                        doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(colors.white);
            doc.text(name, margin + 8, yPos + 8);
            
            // Add score badge
            const scoreText = `${score}/10`;
            const scoreWidth = doc.getTextWidth(scoreText) + 10;
            doc.setFillColor(colors.white);
            doc.roundedRect(pageWidth - margin - scoreWidth - 8, yPos + 2, scoreWidth, 8, 3, 3, 'F');
                        doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(scoreColor);
            doc.text(scoreText, pageWidth - margin - scoreWidth - 3, yPos + 7.5, { align: 'center' });
            
            // Add description
                        doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(colors.dark);
            doc.text(descriptionText, margin + 8, yPos + titleHeight + 8);
            
            // Add effects if available
            if (effects) {
                const effectsY = yPos + titleHeight + descHeight + 12;
                doc.setFont('helvetica', 'italic');
                        doc.setFontSize(9);
                doc.setTextColor(scoreColor);
                doc.text(effectsText, margin + 8, effectsY);
            }
            
            return yPos + cardHeight + 6; // Reduced spacing between cards
        }
        
        // Start creating the PDF
        let yPos = createFancyHeader('Financial Personality Assessment');
        
        // Add introduction
        setFont(fonts.body, colors.dark);
        const introText = 'This report provides an analysis of your financial decision-making style based on your assessment responses. Use these insights to make more informed financial decisions.';
        const introLines = doc.splitTextToSize(introText, pageWidth - (margin * 2));
        doc.text(introLines, margin, yPos);
        yPos += (introLines.length * 5) + 6; // Reduced spacing
        
        // Add date
        const today = new Date();
        const dateStr = `${today.toLocaleDateString()} at ${today.toLocaleTimeString()}`;
        setFont(fonts.small, colors.dark);
        doc.text(`Report generated on: ${dateStr}`, margin, yPos);
        yPos += 8; // Reduced spacing
        
        // Add personality type information
        try {
            // No need to parse again - personalityTypeData is already an object
            const personalityType = personalityTypeData;
            
            if (personalityType && personalityType.primaryType) {
                yPos = createSectionHeader('YOUR FINANCIAL PERSONALITY PROFILE', yPos);
                
                const primary = personalityType.primaryType;
                yPos = drawFancyPersonalityCard(
                    primary.name || 'Your Financial Type',
                    primary.description || 'No description available',
                    primary.strengths || [],
                    yPos,
                    colors.primary
                );
                
                // Add secondary type if available
                if (personalityType.secondaryType) {
                    const secondary = personalityType.secondaryType;
                    yPos = drawFancyPersonalityCard(
                        secondary.name || 'Secondary Type',
                        secondary.description || 'No description available',
                        secondary.strengths || [],
                        yPos,
                        colors.secondary,
                        true // isSecondary
                    );
                }
            }
        } catch (err) {
            console.error('Error adding personality data to PDF:', err);
        }
        
        // Add a page break if we're running out of space
        if (yPos > pageHeight - 50) {
                            doc.addPage();
            yPos = createFancyHeader('Financial Personality Assessment');
        }
        
        // Add cognitive biases information
        try {
            // No need to parse again - biasData is already an object
            const biases = biasData;
            
            if (biases && biases.length > 0) {
                yPos = createSectionHeader('YOUR COGNITIVE BIAS PROFILE', yPos);
                yPos += 4; // Reduced from 5
                
                // Add explanation text
                setFont(fonts.body, colors.dark);
                const biasExplanation = 'Your bias profile shows how different cognitive biases may affect your financial decision making. Higher scores indicate stronger biases that could impact your financial outcomes.';
                const biasLines = doc.splitTextToSize(biasExplanation, pageWidth - (margin * 2));
                doc.text(biasLines, margin, yPos);
                yPos += (biasLines.length * 5) + 6; // Reduced from 10
                
                // Sort biases by score (highest first)
                const sortedBiases = [...biases].sort((a, b) => b.score - a.score);
                
                // Add bias cards
                sortedBiases.forEach(bias => {
                    // Check if we need a new page
                    if (yPos > pageHeight - 60) {
                        doc.addPage();
                        yPos = createFancyHeader('Financial Personality Assessment');
                    }
                    
                    yPos = drawFancyBiasCard(
                        bias.name,
                        bias.score,
                        bias.description,
                        bias.effects,
                            yPos
                        );
                    });
                }
            } catch (err) {
                console.error('Error adding bias data to PDF:', err);
        }
        
        // Add debiasing strategies section
        yPos = createSectionHeader('RECOMMENDATIONS & STRATEGIES', yPos + 6); // Reduced from 10
        yPos += 4; // Reduced from 5
        
        // Add debiasing strategies content
            setFont(fonts.body, colors.dark);
        const strategyText = 'Based on your profile, here are some strategies to improve your financial decision-making:';
        doc.text(strategyText, margin, yPos);
        yPos += 8; // Reduced from 10
        
        // Add generic strategies
        const strategies = [
            {
                title: 'Awareness is the First Step',
                text: 'Simply being aware of your financial personality type and cognitive biases can help you make more balanced decisions.'
            },
            {
                title: 'Create Decision Checklists',
                text: 'Before making important financial decisions, use a checklist to ensure you\'re considering all relevant factors and not just following instincts.'
            },
            {
                title: 'Seek Diverse Perspectives',
                text: 'Consult with people who have different financial personality types to gain broader insights before making major decisions.'
            },
            {
                title: 'Regular Self-Assessment',
                text: 'Periodically retake this assessment to track how your financial tendencies evolve over time and with experience.'
            }
        ];
        
        strategies.forEach(strategy => {
            // Check if we need a new page
            if (yPos > pageHeight - 25) {
                doc.addPage();
                yPos = createFancyHeader('Financial Personality Assessment');
            }
            
            setFont(fonts.subheading, colors.primary);
            doc.text(strategy.title, margin, yPos);
            yPos += 5;
            
            setFont(fonts.body, colors.dark);
            const stratText = doc.splitTextToSize(strategy.text, pageWidth - (margin * 2));
            doc.text(stratText, margin, yPos);
            yPos += (stratText.length * 5) + 6; // Reduced from 8
        });
        
        // Add footer to all pages
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Add footer line
            doc.setDrawColor(colors.primary);
            doc.setLineWidth(0.5);
            doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
            
            // Add footer text
            setFont(fonts.small, colors.dark);
            doc.text('Financial Personality Assessment', margin, pageHeight - 6);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
        }
        
        // Save the PDF
        const filename = 'Financial_Personality_Assessment.pdf';
        doc.save(filename);
        
        // Hide loading spinner
        hideLoadingSpinner();
        
        // Show success notification
        showNotification('Your assessment results have been exported to PDF!', 'success');
        
        return true;
    } catch (error) {
        console.error('Error creating PDF:', error);
        hideLoadingSpinner();
        showNotification('There was an error exporting to PDF. Please try again.', 'error');
        return false;
    }
}

// Local storage helpers
function saveToLocalStorage(key, value) {
    try {
        const serializedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        localStorage.setItem(key, serializedValue);
        return true;
    } catch (error) {
        console.error(`Error saving to localStorage (${key}):`, error);
        return false;
    }
}

function getFromLocalStorage(key) {
    try {
        const value = localStorage.getItem(key);
        
        if (value === null) return null;
        
        // Try to parse as JSON, if fails return as is
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    } catch (error) {
        console.error(`Error reading from localStorage (${key}):`, error);
        return null;
    }
}

// Track user engagement (in a real app, this would send to an analytics service)
function trackEngagement(event, data = {}) {
    // Only log to console in development mode
    const isDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
        console.log('Tracking event:', event, data);
    }
    
    // In a real app, this would send data to an analytics service
    // For example:
    // if (typeof gtag === 'function') {
    //     gtag('event', event, data);
    // }
}

// Make functions available globally
window.navigateTo = navigateTo;
window.trackEngagement = trackEngagement;
window.exportResultsToPDF = exportResultsToPDF;

// Create a global function to show saved results that can be called directly from links
window.showSavedResults = function() {
    console.log('Direct showSavedResults function called');
    
    // We need to manually check if results exist
    const savedBiases = getFromLocalStorage(STORAGE_KEYS.USER_BIASES);
    
    if (savedBiases) {
        console.log('Found saved results, displaying them');
        
        // Hide all sections first
        hideAllSections();
        
        // Show the results section
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            resultsSection.classList.remove('hidden');
            resultsSection.style.display = 'block';
            
            // Track this view
            trackEngagement('view_saved_results');
            
            // Update URL without triggering the router again
            history.replaceState(null, '', '#results');
            
            // Display the results if not already shown
            if (typeof displayResults === 'function') {
                displayResults(savedBiases);
            }
            
            // Scroll to top with offset for header
            const headerHeight = document.querySelector('header')?.offsetHeight || 80;
            window.scrollTo({
                top: headerHeight, // Just scroll past the header
                behavior: 'smooth'
            });
        }
    } else {
        console.log('No saved results found, showing friendly notice to take assessment first');
        
        // Show a professional popup message instead of redirecting
        showProfessionalNotice('No Results Yet', 
            'You need to complete the assessment at least once to view your financial personality results.', 
            'Take Assessment Now');
        
        // Track this attempt
        trackEngagement('attempt_view_results_without_assessment');
    }
    
    return false; // Prevent default link behavior
};

// Professional notice function for better user experience
function showProfessionalNotice(title, message, buttonText) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center transition-opacity duration-300 opacity-0';
    document.body.appendChild(overlay);
    
    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'bg-white rounded-lg shadow-xl p-6 mx-4 max-w-md w-full transform transition-transform duration-300 scale-95';
    modal.innerHTML = `
        <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">${title}</h3>
            <p class="text-gray-600 mb-6">${message}</p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
                <button id="modal-take-assessment" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-300">${buttonText}</button>
                <button id="modal-close" class="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors duration-300">Close</button>
            </div>
        </div>
    `;
    overlay.appendChild(modal);
    
    // Add animation timeout
    setTimeout(() => {
        overlay.classList.remove('opacity-0');
        modal.classList.remove('scale-95');
        modal.classList.add('scale-100');
    }, 10);
    
    // Add event listeners
    document.getElementById('modal-take-assessment').addEventListener('click', () => {
        closeModal();
        navigateTo('assessment');
    });
    
    document.getElementById('modal-close').addEventListener('click', closeModal);
    
    // Close when clicking outside
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    
    // Close modal function
    function closeModal() {
        overlay.classList.add('opacity-0');
        modal.classList.remove('scale-100');
        modal.classList.add('scale-95');
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
    }
}

// Function to animate counting up for statistics
function animateCounters() {
    const userCounter = document.getElementById('users-counter');
    if (!userCounter) return;
    
    const targetCount = 50000;
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    const startValue = 0;
    
    function updateCounter() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        
        if (elapsedTime < duration) {
            const value = Math.floor(startValue + (targetCount - startValue) * (elapsedTime / duration));
            userCounter.textContent = value.toLocaleString() + '+';
            requestAnimationFrame(updateCounter);
        } else {
            userCounter.textContent = targetCount.toLocaleString() + '+';
        }
    }
    
    updateCounter();
}

// Helper to draw bias card with modern styling
function drawBiasCard(name, score, description, effects, y) {
    const cardMargin = 4;
    const cardWidth = contentWidth;
    const titleHeight = 20;
    let contentHeight = 0;
    
    // Determine color based on score
    let color = colors.green;
    let severityText = 'Mild';
    let severityIcon = '✓'; // Checkmark for mild
    
    if (score >= 8) {
        color = colors.red;
        severityText = 'Strong';
        severityIcon = '!'; // Exclamation for strong
    } else if (score >= 6) {
        color = colors.accent;
        severityText = 'Moderate';
        severityIcon = '⚠'; // Warning for moderate
    } else if (score >= 4) {
        color = colors.secondary;
        severityText = 'Mild';
        severityIcon = '✓'; // Checkmark for mild
    }
    
    // Measure text height
    const descLines = doc.splitTextToSize(description, cardWidth - (cardMargin * 4) - 10);
    const descHeight = descLines.length * (fonts.body.size / 2.5) + 4;
    
    // Calculate effects height if available
    let effectsHeight = 0;
    if (effects) {
        const effectLines = doc.splitTextToSize(effects, cardWidth - (cardMargin * 4) - 10);
        effectsHeight = effectLines.length * (fonts.caption.size / 2.5) + 14;
    }
    
    // Total content height
    contentHeight = titleHeight + descHeight + effectsHeight + (cardMargin * 4);
    
    // Create a shadow effect for the card
    doc.setFillColor(100, 100, 100, 0.1);
    doc.roundedRect(margin + 2, y + 2, cardWidth, contentHeight, 3, 3, 'F');
    
    // Draw card background with subtle gradient
    const gradientCoords = {
        x1: margin, y1: y,
        x2: margin, y2: y + contentHeight
    };
    
    // Create gradient from white to very light color
    const grd = doc.setGradient("axial", 
        gradientCoords.x1, gradientCoords.y1, gradientCoords.x2, gradientCoords.y2,
        [[0, 'F1F5F9'], [1, 'FFFFFF']]
    );
    
    // Draw card with gradient background
    doc.setFillColor(grd);
    doc.roundedRect(margin, y, cardWidth, contentHeight, 3, 3, 'F');
    
    // Add a styled border
    doc.setDrawColor(color[0], color[1], color[2], 0.5);
    doc.setLineWidth(0.7);
    doc.roundedRect(margin, y, cardWidth, contentHeight, 3, 3, 'D');
    
    // Draw accent curve at top
    doc.setFillColor(color[0], color[1], color[2]);
    
    // Draw a small accent rectangle at top
    doc.setFillColor(color[0], color[1], color[2], 0.1);
    doc.roundedRect(margin, y, cardWidth, 10, 3, 3, 'F');
    
    // Draw score indicator on the left side - now a vertical accent bar
    const indicatorWidth = 4;
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(margin, y, indicatorWidth, contentHeight, 'F');
    
    // Add title with improved typography
    setFont(fonts.subheading, colors.dark);
    doc.text(name, margin + indicatorWidth + 8, y + 7);
    
    // Add severity indicator with icon in a circle
    const nameWidth = doc.getTextWidth(name);
    const iconX = margin + indicatorWidth + nameWidth + 14;
    const iconY = y + 7;
    
    // Draw circle for severity indicator
    doc.setFillColor(color[0], color[1], color[2], 0.15);
    doc.circle(iconX - 2, iconY - 2, 6, 'F');
    
    // Add severity icon
    setFont({font: 'helvetica', style: 'bold', size: 8}, color);
    doc.text(severityIcon, iconX - 2, iconY - 0.5, {align: 'center'});
    
    // Add severity text after icon
    setFont(fonts.small, color);
    doc.text(`(${severityText})`, iconX + 5, y + 7);
    
    // Create a modern score visualization
    const scoreBarX = margin + indicatorWidth + 8;
    const scoreBarY = y + 14;
    const scoreBarWidth = 110;
    const scoreBarHeight = 5;
    
    // Score bar background with gradient
    const scoreGrd = doc.setGradient("axial", 
        scoreBarX, scoreBarY, 
        scoreBarX + scoreBarWidth, scoreBarY,
        [[0, 'F3F4F6'], [1, 'E5E7EB']]
    );
    
    doc.setFillColor(scoreGrd);
    doc.roundedRect(scoreBarX, scoreBarY, scoreBarWidth, scoreBarHeight, 2.5, 2.5, 'F');
    
    // Calculate filled score width
    const filledScoreWidth = Math.max((score / 10) * scoreBarWidth, 10);
    
    // Score indicator with gradient matching severity
    const lightColorHex = getColorWithOpacity(color, 0.7);
    const normalColorHex = rgbToHex(color[0], color[1], color[2]);
    
    const scoreFilledGrd = doc.setGradient("axial", 
        scoreBarX, scoreBarY, 
        scoreBarX + filledScoreWidth, scoreBarY,
        [[0, normalColorHex], [1, lightColorHex]]
    );
    
    doc.setFillColor(scoreFilledGrd);
    doc.roundedRect(scoreBarX, scoreBarY, filledScoreWidth, scoreBarHeight, 2.5, 2.5, 'F');
    
    // Add score text
    setFont(fonts.small, colors.dark);
    doc.text(`${score.toFixed(1)}/10`, scoreBarX + scoreBarWidth + 8, scoreBarY + 3.5);
    
    // Add description with improved styling
    setFont({font: 'helvetica', style: 'normal', size: 11}, colors.dark);
    const descY = scoreBarY + 12;
    doc.text(descLines, margin + indicatorWidth + 8, descY);
    
    // Add financial impact if available
    if (effects) {
        const impactY = descY + (descLines.length * 7) + 8;
        
        // Draw impact section with subtle background
        const impactBoxY = impactY - 6;
        const impactBoxHeight = (effectLines.length * 5) + 12;
        
        doc.setFillColor(color[0], color[1], color[2], 0.05);
        doc.roundedRect(margin + 12, impactBoxY, cardWidth - 24, impactBoxHeight, 2, 2, 'F');
        
        // Add impact heading with icon
        setFont({font: 'helvetica', style: 'bold', size: 9}, color);
        doc.text('💰 Financial Impact:', margin + 20, impactY);
        
        // Add impact text
        setFont({font: 'helvetica', style: 'italic', size: 9}, colors.dark);
        doc.text(effectLines, margin + 20, impactY + 6);
    }
    
    return y + contentHeight + 8; // Added extra space between cards
}

// Helper function to hide all sections
function hideAllSections() {
    console.log('Hiding all sections');
    
    // Get all major sections by ID
    const sections = [
        document.getElementById('assessment-section'),
        document.getElementById('results-section'),
        document.getElementById('about'),
        document.getElementById('faq'),
        document.getElementById('contact'),
        document.getElementById('welcome-back'),
        document.getElementById('hero-section'),
        document.getElementById('social-proof-section')
    ];
    
    // Hide all sections found
    sections.forEach(section => {
        if (section) {
            section.classList.add('hidden');
            section.style.display = 'none';
            console.log(`Hidden section: ${section.id}`);
        }
    });
    
    // Also hide all other top-level sections that might not have IDs
    const homeContentSections = document.querySelectorAll('main > section:not(#assessment-section):not(#results-section):not(#about):not(#faq):not(#contact):not(#hero-section):not(#social-proof-section)');
    homeContentSections.forEach(section => {
        if (section) {
            section.classList.add('hidden');
            section.style.display = 'none';
            console.log(`Hidden section without ID: ${section.className}`);
        }
    });
}

// Helper function to convert RGB to hex
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Helper function to get color with opacity for gradients
function getColorWithOpacity(color, opacity) {
    const r = Math.round(color[0] + (255 - color[0]) * (1 - opacity));
    const g = Math.round(color[1] + (255 - color[1]) * (1 - opacity));
    const b = Math.round(color[2] + (255 - color[2]) * (1 - opacity));
    return rgbToHex(r, g, b);
}

// Helper to add multi-line text with word wrapping
function addWrappedText(text, x, y, maxWidth, lineHeight = 7) {
    if (!text) return y; // Handle null or undefined text
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * lineHeight);
}

// Helper to create section header with styling
function addSectionHeader(text, y, color = colors.primary) {
    // Background highlight
    doc.setFillColor(color[0], color[1], color[2], 0.1);
    doc.roundedRect(margin - 5, y - 6, contentWidth + 10, 12, 2, 2, 'F');
    
    // Left accent bar
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(margin - 5, y - 6, 3, 12, 'F');
    
    // Text
    setFont(fonts.heading3, color);
    doc.text(text, margin + 5, y);
    
    return y + 10;
}

// Helper to draw personality type card with styling
function drawPersonalityCard(name, description, strengths, y, color, isSecondary = false) {
    const cardMargin = 5;
    const cardWidth = contentWidth;
    const titleHeight = 20;
    let contentHeight = 0;
    
    // Measure text height
    const descLines = doc.splitTextToSize(description, cardWidth - (cardMargin * 4));
    const descHeight = descLines.length * (fonts.body.size / 2.3);
    
    // Calculate strengths height if available
    let strengthsHeight = 0;
    if (strengths && strengths.length) {
        strengthsHeight = (strengths.length * 7) + 15;
    }
    
    // Total content height
    contentHeight = titleHeight + descHeight + strengthsHeight + (cardMargin * 5);
    
    // Create a shadow effect
    doc.setFillColor(70, 70, 70, 0.07);
    doc.roundedRect(margin + 3, y + 3, cardWidth, contentHeight, 5, 5, 'F');
    
    // Draw card background with gradient
    const cardGradient = doc.setGradient("axial",
        margin, y,
        margin, y + contentHeight,
        [[0, 'FFFFFF'], [1, 'F9FAFB']]
    );
    
    doc.setFillColor(cardGradient);
    doc.roundedRect(margin, y, cardWidth, contentHeight, 5, 5, 'F');
    
    // Get color with lighter version for gradients
    const lightColorHex = getColorWithOpacity(color, 0.9);
    const normalColorHex = rgbToHex(color[0], color[1], color[2]);
    
    // Create header gradient
    const headerGradient = doc.setGradient("axial",
        margin, y,
        margin + cardWidth, y,
        [[0, normalColorHex], [1, lightColorHex]]
    );
    
    // Draw title area with personality color gradient
    doc.setFillColor(headerGradient);
    doc.roundedRect(margin, y, cardWidth, titleHeight + 5, 5, 5, 'F');
    
    // Only round top corners and extend down
    doc.setFillColor(headerGradient);
    doc.rect(margin, y + 5, cardWidth, titleHeight, 'F');
    
    // Add decorative elements to header
    for (let i = 0; i < 5; i++) {
        const opacity = 0.1 - (i * 0.02);
        const size = 20 - (i * 3);
        doc.setFillColor(255, 255, 255, opacity);
        doc.circle(margin + cardWidth - 25, y + 10, size, 'F');
    }
    
    // Add personality icon (simplified icon based on type)
    doc.setFillColor(255, 255, 255, 0.9);
    const iconX = margin + 22;
    const iconY = y + titleHeight/2 + 2;
    
    if (name.includes("Visionary") || name.includes("Risk")) {
        // Draw rocket-like icon for visionary types
        doc.circle(iconX, iconY, 8, 'F'); // Head
        doc.setFillColor(255, 255, 255, 0.7);
        doc.rect(iconX - 3, iconY, 6, 10, 'F'); // Body
        doc.setFillColor(255, 255, 255, 0.5);
        doc.triangle(iconX - 6, iconY + 10, iconX, iconY + 5, iconX + 6, iconY + 10, 'F'); // Wings
    } else if (name.includes("Follower") || name.includes("Structured")) {
        // Draw structured/follower icon
        doc.roundedRect(iconX - 7, iconY - 7, 14, 14, 2, 2, 'F'); // Base
        doc.setFillColor(color[0], color[1], color[2], 0.3);
        doc.rect(iconX - 5, iconY - 2, 10, 2, 'F'); // Lines
        doc.rect(iconX - 5, iconY + 2, 10, 2, 'F');
    } else {
        // Generic icon
        doc.circle(iconX, iconY, 8, 'F');
        doc.setFillColor(color[0], color[1], color[2], 0.3);
        doc.circle(iconX, iconY, 4, 'F');
    }
    
    // Add title with shadow effect
    setFont({font: 'helvetica', style: 'bold', size: isSecondary ? 14 : 16}, colors.white);
    const titleX = margin + 45;
    doc.text(name, titleX + 0.5, y + titleHeight/2 + 2.5); // Shadow
    doc.text(name, titleX, y + titleHeight/2 + 2);
    
    // Add secondary label if applicable
    if (isSecondary) {
        setFont({font: 'helvetica', style: 'italic', size: 9}, colors.white);
        doc.text('Secondary Type', margin + cardWidth - 30, y + 8, {align: 'right'});
    }
    
    // Add description with improved styling
    setFont({font: 'helvetica', style: 'normal', size: 11}, colors.dark);
    y += titleHeight + cardMargin + 5;
    
    // Add a decorative quote mark for the description
    setFont({font: 'helvetica', style: 'bold', size: 24}, [color[0], color[1], color[2], 0.2]);
    doc.text('"', margin + cardMargin * 2, y + 2);
    
    // Add description text
    setFont({font: 'helvetica', style: 'normal', size: 11}, colors.dark);
    doc.text(descLines, margin + cardMargin * 4, y);
    
    y += descHeight + 5;
    
    // Add strengths with modern styling if available
    if (strengths && strengths.length) {
        // Add strengths container with subtle background
        const strengthsBoxY = y;
        const strengthsBoxHeight = strengthsHeight;
        
        // Draw strengths background
        doc.setFillColor(color[0], color[1], color[2], 0.05);
        doc.roundedRect(margin + cardMargin * 2, strengthsBoxY, cardWidth - (cardMargin * 4), strengthsBoxHeight, 3, 3, 'F');
        
        // Add strengths header with icon
        setFont({font: 'helvetica', style: 'bold', size: 12}, color);
        doc.text('✦ Key Strengths', margin + cardMargin * 4, strengthsBoxY + 10);
        
        // Add divider
        doc.setDrawColor(color[0], color[1], color[2], 0.3);
        doc.setLineWidth(0.5);
        doc.line(margin + cardMargin * 4, strengthsBoxY + 14, margin + cardWidth - (cardMargin * 4), strengthsBoxY + 14);
        
        // Add each strength with icon
        setFont({font: 'helvetica', style: 'normal', size: 10}, colors.dark);
        strengths.forEach((strength, index) => {
            const strengthY = strengthsBoxY + 20 + (index * 7);
            
            // Draw custom checkmark
            doc.setFillColor(color[0], color[1], color[2], 0.7);
            doc.circle(margin + cardMargin * 4 + 2, strengthY - 2, 2, 'F');
            
            // Add strength text
            doc.text(strength, margin + cardMargin * 4 + 10, strengthY);
        });
    }
    
    // Add decorative corner elements
    doc.setDrawColor(color[0], color[1], color[2], 0.2);
    doc.setLineWidth(0.5);
    
    // Top-right corner
    doc.line(margin + cardWidth - 10, y - descHeight - 15, margin + cardWidth - 10, y - descHeight - 5);
    doc.line(margin + cardWidth - 15, y - descHeight - 10, margin + cardWidth - 5, y - descHeight - 10);
    
    // Bottom-left corner
    const bottomY = y + (strengths && strengths.length ? strengthsHeight + 5 : 10);
    doc.line(margin + 10, bottomY, margin + 10, bottomY + 10);
    doc.line(margin + 5, bottomY + 5, margin + 15, bottomY + 5);
    
    return y + (strengths && strengths.length ? strengthsHeight + 10 : 15);
}

// Create a helper function for creating modern section headers with decorative elements
function addModernSectionHeader(text, y, color = colors.primary) {
    // Create an elegant header background with gradient
    const headerGradient = doc.setGradient("linear",
        margin - 5, y - 8,
        pageWidth - margin + 5, y - 8 + 18,
        [[0, rgbToHex(color[0], color[1], color[2], 0.05)], 
         [0.5, rgbToHex(color[0], color[1], color[2], 0.1)],
         [1, rgbToHex(color[0], color[1], color[2], 0.05)]]
    );
    
    // Draw modern header background
    doc.setFillColor(headerGradient);
    doc.roundedRect(margin - 5, y - 8, contentWidth + 10, 18, 4, 4, 'F');
    
    // Add left accent bar with gradient
    const accentGradient = doc.setGradient("linear",
        margin - 5, y - 8,
        margin - 2, y - 8,
        [[0, rgbToHex(color[0], color[1], color[2])], 
         [1, getColorWithOpacity(color, 0.7)]]
    );
    
    // Draw accent bar
    doc.setFillColor(accentGradient);
    doc.roundedRect(margin - 5, y - 8, 3, 18, 2, 2, 'F');
    
    // Draw decorative dots
    for (let i = 0; i < 3; i++) {
        const dotX = pageWidth - margin - 10 - (i * 8);
        doc.setFillColor(color[0], color[1], color[2], 0.4 - (i * 0.1));
        doc.circle(dotX, y, 2 - (i * 0.5), 'F');
    }
    
    // Add section title with professional styling
    setFont({font: 'helvetica', style: 'bold', size: 13}, color);
    doc.text(text.toUpperCase(), margin + 5, y + 2);
    
    // Add subtle underline
    doc.setDrawColor(color[0], color[1], color[2], 0.3);
    doc.setLineWidth(0.5);
    doc.line(margin + 5, y + 5, margin + 5 + doc.getTextWidth(text.toUpperCase()), y + 5);
    
    return y + 15;
}

// Helper function to create an enhanced implementation tips box at the end of the PDF
function addImplementationTipsBox(doc, yPos) {
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);
    const tipsHeight = 85;
    const colors = {
        primary: [59, 130, 246],
        primaryLight: [219, 234, 254],
        secondary: [16, 185, 129],
        accent: [245, 158, 11],
        dark: [31, 41, 55]
    };
    
    // Create a background with subtle gradient
    const boxGradient = doc.setGradient("linear",
        margin, yPos,
        margin, yPos + tipsHeight,
        [[0, 'F0F9FF'], [1, 'EFF6FF']]  // Very light blue gradient
    );
    
    // Draw background
    doc.setFillColor(boxGradient);
    doc.roundedRect(margin, yPos, contentWidth, tipsHeight, 5, 5, 'F');
    
    // Add decorative border
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2], 0.3);
    doc.setLineWidth(0.7);
    doc.setLineDashPattern([3, 2], 0);
    doc.roundedRect(margin + 2, yPos + 2, contentWidth - 4, tipsHeight - 4, 5, 5, 'D');
    doc.setLineDashPattern([], 0);
    
    // Add decorative corner elements
    const cornerSize = 8;
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2], 0.5);
    doc.setLineWidth(0.8);
    
    // Top-left corner
    doc.line(margin + 5, yPos + 5, margin + 5 + cornerSize, yPos + 5);
    doc.line(margin + 5, yPos + 5, margin + 5, yPos + 5 + cornerSize);
    
    // Bottom-right corner
    doc.line(margin + contentWidth - 5, yPos + tipsHeight - 5, margin + contentWidth - 5 - cornerSize, yPos + tipsHeight - 5);
    doc.line(margin + contentWidth - 5, yPos + tipsHeight - 5, margin + contentWidth - 5, yPos + tipsHeight - 5 - cornerSize);
    
    // Add title with icon and styling
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    
    // Add lightbulb icon (simplified)
    const iconX = margin + 15;
    const iconY = yPos + 15;
    
    // Draw bulb circle
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2], 0.7);
    doc.circle(iconX, iconY, 5, 'F');
    
    // Draw bulb base
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2], 0.7);
    doc.setLineWidth(1.5);
    doc.line(iconX - 2, iconY + 5, iconX + 2, iconY + 7);
    
    // Draw light rays
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2], 0.4);
    doc.setLineWidth(0.5);
    for (let angle = 0; angle < 360; angle += 45) {
        const radians = angle * Math.PI / 180;
        const x1 = iconX + 6 * Math.cos(radians);
        const y1 = iconY + 6 * Math.sin(radians);
        const x2 = iconX + 10 * Math.cos(radians);
        const y2 = iconY + 10 * Math.sin(radians);
        doc.line(x1, y1, x2, y2);
    }
    
    // Add title text
    doc.text('Implementation Tips', margin + 30, yPos + 16);
    
    // Add divider with gradient
    const dividerGradient = doc.setGradient("linear",
        margin + 10, yPos + 24,
        margin + contentWidth - 10, yPos + 24,
        [[0, 'FFFFFF'], [0.5, '3B82F6'], [1, 'FFFFFF']]
    );
    
    doc.setFillColor(dividerGradient);
    doc.rect(margin + 10, yPos + 23, contentWidth - 20, 0.5, 'F');
    
    // Add modernized tip list
    const tips = [
        "Start with one strategy at a time rather than trying to change everything at once.",
        "Schedule a monthly review of your financial decisions to track improvement.",
        "Share your insights with a trusted friend who can help hold you accountable.",
        "Consider working with a financial advisor who understands cognitive biases."
    ];
    
    let tipY = yPos + 35;
    tips.forEach((tip, index) => {
        // Draw numbered bubble
        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2], 0.1);
        doc.circle(margin + 12, tipY - 2, 8, 'F');
        
        // Add number
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.text((index + 1).toString(), margin + 12, tipY, {align: 'center'});
        
        // Add tip text with improved styling
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        
        const tipLines = doc.splitTextToSize(tip, contentWidth - 40);
        doc.text(tipLines, margin + 25, tipY);
        
        tipY += (tipLines.length * 6) + 5;
    });
    
    return yPos + tipsHeight + 5;
}

// Handle responsive navigation
function handleResponsiveNavigation() {
    console.log('Handling responsive navigation');
    const desktopNav = document.querySelector('nav');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const heroSection = document.getElementById('hero-section');
    const socialProofSection = document.getElementById('social-proof-section');
    const header = document.querySelector('header');
    const progressTracker = document.getElementById('progress-tracker');
    
    // Ensure header has consistent height
    if (header) {
        // Make sure header has the necessary styles
            header.style.height = '60px';
            header.style.minHeight = '60px';
            header.style.maxHeight = '60px';
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        
        // Ensure progress tracker is properly positioned
        if (progressTracker) {
            if (window.innerWidth < 768) {
                progressTracker.style.right = '60px';
            } else {
                progressTracker.style.right = '180px';
            }
        }
    }
    
    // Current view size
    const isMobile = window.innerWidth < 768;
    console.log('Is mobile view:', isMobile, 'Width:', window.innerWidth);
    
    // Always ensure mobile menu button is visible on small screens
    if (mobileMenuButton) {
        if (isMobile) {
            // Ensure button is visible on mobile
            mobileMenuButton.style.display = 'flex';
            mobileMenuButton.classList.remove('hidden');
            
            // For very small screens, ensure the button is positioned correctly
            if (window.innerWidth <= 375) {
                mobileMenuButton.style.position = 'absolute';
                mobileMenuButton.style.right = '8px';
                mobileMenuButton.style.top = '50%';
                mobileMenuButton.style.transform = 'translateY(-50%)';
                mobileMenuButton.style.zIndex = '9999';
            }
        } else {
            // Hide on desktop
            mobileMenuButton.style.display = 'none';
            mobileMenuButton.classList.add('hidden');
        }
    }
    
    if (!isMobile) {
        // On desktop
        if (desktopNav) {
            desktopNav.classList.remove('hidden');
            // Force display style directly for browsers that might not respect the class change
            desktopNav.style.display = 'flex';
            console.log('Desktop nav visible');
        }
        
        // Always hide mobile menu on desktop
        if (mobileMenu) {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('open');
            // Force display style directly
            mobileMenu.style.display = 'none';
        }
        
        // Reset desktop-specific styles
        if (heroSection) {
            heroSection.style.width = '';
            heroSection.style.maxWidth = '';
            heroSection.style.padding = '';
        }
        
        if (socialProofSection) {
            const counterSection = socialProofSection.querySelector('.flex-col');
            if (counterSection) {
                counterSection.style.flexDirection = '';
            }
        }
    } else {
        // On mobile
        if (desktopNav) {
            // Hide desktop nav on mobile but keep the md:flex class
            desktopNav.classList.add('hidden');
            // Force display style directly
            desktopNav.style.display = 'none';
        }
        
        // Make sure mobile menu is properly hidden unless explicitly opened
        if (mobileMenu && !mobileMenu.classList.contains('open')) {
            mobileMenu.classList.add('hidden');
            // Force display style directly
            mobileMenu.style.display = 'none';
        }
        
        // Apply mobile-specific styles
        if (heroSection) {
            // Use !important to override any conflicting styles
            heroSection.style.cssText = 'width: 100% !important; max-width: calc(100% - 16px) !important; margin-left: auto !important; margin-right: auto !important;';
            
            // Make sure the Start Assessment button is visible and properly sized
            const heroStartButton = document.getElementById('hero-start-assessment');
            if (heroStartButton) {
                if (window.innerWidth <= 375) {
                    heroStartButton.style.display = 'flex';
                    heroStartButton.style.justifyContent = 'center';
                    heroStartButton.style.alignItems = 'center';
                    heroStartButton.style.minHeight = '44px';
                    heroStartButton.style.margin = '0 auto';
                    heroStartButton.style.maxWidth = '200px';
                }
            }
        }
        
        if (socialProofSection) {
            const counterSection = socialProofSection.querySelector('.flex-col');
            if (counterSection) {
                counterSection.style.cssText = 'flex-direction: column !important; width: 100% !important; gap: 1.5rem !important;';
            }
        }
    }
    
    // Force reflow of the page to ensure styles are applied
    document.body.classList.toggle('force-reflow');
    setTimeout(() => document.body.classList.toggle('force-reflow'), 10);
}

// Function to call on window resize
window.addEventListener('resize', handleResponsiveNavigation);

// Also call it on page load to ensure correct initial state
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(handleResponsiveNavigation, 100);
});

// Call on orientation change
window.addEventListener('orientationchange', function() {
    setTimeout(handleResponsiveNavigation, 200);
});
    
/**
 * Shows a loading spinner with a custom message
 * @param {string} message - The message to display with the spinner
 */
function showLoadingSpinner(message = 'Loading...') {
    // Check if a spinner already exists
    let spinner = document.getElementById('loading-spinner');
    
    // If spinner doesn't exist, create it
    if (!spinner) {
        // Create the spinner container
        spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';
        
        // Create the spinner content
        const spinnerContent = document.createElement('div');
        spinnerContent.className = 'bg-white p-6 rounded-lg shadow-xl max-w-md text-center';
        
        // Add spinner animation
        const spinnerAnimation = document.createElement('div');
        spinnerAnimation.className = 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4';
        
        // Add message
        const spinnerMessage = document.createElement('p');
        spinnerMessage.id = 'spinner-message';
        spinnerMessage.className = 'text-gray-700 text-lg';
        spinnerMessage.textContent = message;
        
        // Assemble the spinner
        spinnerContent.appendChild(spinnerAnimation);
        spinnerContent.appendChild(spinnerMessage);
        spinner.appendChild(spinnerContent);
        
        // Add to the body
        document.body.appendChild(spinner);
    } else {
        // Update the existing spinner message
        const spinnerMessage = document.getElementById('spinner-message');
        if (spinnerMessage) {
            spinnerMessage.textContent = message;
        }
        
        // Make sure it's visible
        spinner.style.display = 'flex';
    }
    
    debugLog('Loading spinner shown:', message);
}

/**
 * Hides the loading spinner
 */
function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        // Fade out effect
        spinner.style.transition = 'opacity 0.3s ease';
        spinner.style.opacity = '0';
        
        // Remove after animation
        setTimeout(() => {
            spinner.remove();
        }, 300);
        
        debugLog('Loading spinner hidden');
    }
}
    
// Google Feedback Form Integration
const GOOGLE_FORM = {
    FORM_ID: '1FAIpQLSdRk-OJWkPDkSp_lDbwOsKDLV9dMwiuk6PhiybVvEY--D1HcQ',
    RATING_ENTRY_ID: 'entry.498183565',   // Rating question
    COMMENTS_ENTRY_ID: 'entry.914717203'  // Comments question
};

// Initialize the feedback form
function initFeedbackForm() {
    // Check if feedback was already submitted
    const feedbackSubmitted = getFromLocalStorage(STORAGE_KEYS.FEEDBACK_SUBMITTED);
    if (feedbackSubmitted === 'true') {
        // Hide the form and show thank you
        const feedbackContainer = document.getElementById('feedback-container');
        const thankYouMessage = document.getElementById('feedback-thank-you');
        
        if (feedbackContainer) {
            feedbackContainer.classList.add('hidden');
        }
        
        if (thankYouMessage) {
            thankYouMessage.classList.remove('hidden');
        }
        
        return;
    }
    
    const submitButton = document.getElementById('submit-feedback');
    const feedbackContainer = document.getElementById('feedback-container');
    const thankYouMessage = document.getElementById('feedback-thank-you');
    
    if (!submitButton) return;
    
    submitButton.addEventListener('click', function() {
        // Get the selected rating
        const ratingInput = document.querySelector('input[name="rating"]:checked');
        const rating = ratingInput ? ratingInput.value : null;
        
        // Get comments
        const comments = document.getElementById('feedback-comment').value.trim();
        
        // Validate input
        if (!rating) {
            showNotification('Please select a rating before submitting', 'info');
            return;
        }
        
        // Submit feedback
        submitFeedbackToGoogleForms(rating, comments);
        
        // Hide form and show thank you message
        feedbackContainer.classList.add('hidden');
        thankYouMessage.classList.remove('hidden');
        
        // Save to localStorage that feedback was submitted
        saveToLocalStorage(STORAGE_KEYS.FEEDBACK_SUBMITTED, 'true');
        
        // Track engagement if available
        trackEngagement('feedback_submitted', { rating });
    });
}

// Submit feedback to Google Forms without page redirect
function submitFeedbackToGoogleForms(rating, comments) {
    // Show loading indicator
    showLoadingSpinner('Sending your feedback...');
    
    // Build the Google Form submission URL
    const googleFormsUrl = `https://docs.google.com/forms/d/e/${GOOGLE_FORM.FORM_ID}/formResponse`;
    
    // Create an invisible iframe to handle the form submission
    const iframe = document.createElement('iframe');
    iframe.name = 'hidden_iframe';
    iframe.id = 'hidden_iframe';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Create the form element
    const form = document.createElement('form');
    form.action = googleFormsUrl;
    form.method = 'POST';
    form.target = 'hidden_iframe';
    
    // Add form data as hidden inputs
    const addInput = (name, value) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value || '';
        form.appendChild(input);
    };
    
    // Add each piece of data
    addInput(GOOGLE_FORM.RATING_ENTRY_ID, rating);
    addInput(GOOGLE_FORM.COMMENTS_ENTRY_ID, comments);
    
    // Append form to the document and submit
    document.body.appendChild(form);
    
    // Listen for iframe load event
    iframe.addEventListener('load', function() {
        // Hide loading spinner
        hideLoadingSpinner();
        
        // Show success notification
        showNotification('Thank you for your feedback!', 'success');
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(form);
            document.body.removeChild(iframe);
        }, 1000);
    });
    
    // Submit the form
    form.submit();
    
    // Backup in case load event doesn't fire
    setTimeout(() => {
        hideLoadingSpinner();
    }, 3000);
}
