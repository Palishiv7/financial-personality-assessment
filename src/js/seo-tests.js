/**
 * SEO and Functionality Test Suite
 * Verifies that all SEO elements and new functionality work as expected
 */

// Configuration
const SEO_TEST_CONFIG = {
    runOnLoad: true,        // Run tests automatically when page loads
    displayResults: true,   // Display test results in console
    logLevel: 'info'        // 'info', 'warn', or 'error'
};

// Main test runner function
function runSEOTests() {
    console.group('🧪 Running SEO and Functionality Tests');
    const startTime = performance.now();
    
    // Run all test suites
    const results = {
        metaTags: testMetaTags(),
        schemaMarkup: testSchemaMarkup(),
        socialProof: testSocialProofSection(),
        faqSection: testFAQSection(),
        counters: testCounters(),
        navigation: testNavigation()
    };
    
    // Calculate overall results
    const totalTests = Object.values(results).reduce((count, suite) => count + suite.total, 0);
    const passedTests = Object.values(results).reduce((count, suite) => count + suite.passed, 0);
    const success = passedTests === totalTests;
    
    // Log summary
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`✅ Passed: ${passedTests}/${totalTests} tests in ${duration}s`);
    
    if (success) {
        console.log('%c All SEO tests passed! Your site is well-optimized.', 'color: green; font-weight: bold');
    } else {
        console.warn(`%c ${totalTests - passedTests} tests failed. Check details above.`, 'color: orange; font-weight: bold');
    }
    
    console.groupEnd();
    
    return {
        success,
        passedTests,
        totalTests,
        duration,
        suites: results
    };
}

/**
 * Test Suite: Meta Tags
 * Verifies that all required meta tags are present and properly formatted
 */
function testMetaTags() {
    console.group('Testing Meta Tags');
    let passed = 0;
    let total = 0;
    
    // Test 1: Title
    total++;
    const title = document.title;
    const hasValidTitle = title && title.includes('Financial Personality Assessment');
    logTest('Page has proper title', hasValidTitle, title);
    if (hasValidTitle) passed++;
    
    // Test 2: Description
    total++;
    const description = document.querySelector('meta[name="description"]');
    const hasDescription = description && description.content.length > 50;
    logTest('Meta description exists and is adequate length', hasDescription, description ? description.content : null);
    if (hasDescription) passed++;
    
    // Test 3: Keywords
    total++;
    const keywords = document.querySelector('meta[name="keywords"]');
    const hasKeywords = keywords && keywords.content.includes('financial personality test');
    logTest('Meta keywords exist and include target phrases', hasKeywords, keywords ? keywords.content.substring(0, 50) + '...' : null);
    if (hasKeywords) passed++;
    
    // Test 4: Canonical URL
    total++;
    const canonical = document.querySelector('link[rel="canonical"]');
    const hasCanonical = canonical && canonical.href.includes('financialpersonality.com');
    logTest('Canonical URL is properly set', hasCanonical, canonical ? canonical.href : null);
    if (hasCanonical) passed++;
    
    // Test 5: Open Graph tags
    total++;
    const og = document.querySelector('meta[property="og:title"]');
    const hasOg = og && og.content.length > 0;
    logTest('Open Graph tags exist', hasOg);
    if (hasOg) passed++;
    
    console.groupEnd();
    return { passed, total };
}

/**
 * Test Suite: Schema.org Markup
 * Verifies that structured data is present and valid
 */
function testSchemaMarkup() {
    console.group('Testing Schema.org Markup');
    let passed = 0;
    let total = 0;
    
    // Test 1: Schema script exists
    total++;
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    const hasSchema = !!schemaScript;
    logTest('Schema.org script exists', hasSchema);
    if (hasSchema) passed++;
    
    // Skip other tests if schema doesn't exist
    if (!hasSchema) {
        console.groupEnd();
        return { passed, total };
    }
    
    // Test 2: Schema has correct type
    total++;
    let schemaData;
    try {
        schemaData = JSON.parse(schemaScript.textContent);
        const hasCorrectType = schemaData['@type'] === 'WebApplication';
        logTest('Schema has correct @type (WebApplication)', hasCorrectType);
        if (hasCorrectType) passed++;
    } catch (e) {
        logTest('Schema JSON is valid', false, e.message);
    }
    
    // Test 3: Schema has price (free)
    total++;
    if (schemaData) {
        const hasPrice = schemaData.offers && schemaData.offers.price === '0';
        logTest('Schema indicates free assessment', hasPrice);
        if (hasPrice) passed++;
    }
    
    console.groupEnd();
    return { passed, total };
}

/**
 * Test Suite: Social Proof Section
 * Verifies that social proof elements exist and are properly formatted
 */
function testSocialProofSection() {
    console.group('Testing Social Proof Section');
    let passed = 0;
    let total = 0;
    
    // Test 1: Stats counter section exists
    total++;
    const statsSection = document.querySelector('.social-proof') || document.querySelector('#users-counter');
    const hasSocialProof = !!statsSection;
    logTest('Social proof section exists', hasSocialProof);
    if (hasSocialProof) passed++;
    
    // Test 2: User counter exists
    total++;
    const userCounter = document.getElementById('users-counter');
    const hasCounter = !!userCounter;
    logTest('Users counter exists', hasCounter);
    if (hasCounter) passed++;
    
    // Test 3: Testimonials exist
    total++;
    const testimonials = document.querySelectorAll('.bg-white.p-6.rounded-lg.shadow-md.relative');
    const hasTestimonials = testimonials.length >= 3;
    logTest('At least 3 testimonials exist', hasTestimonials, testimonials.length + ' testimonials found');
    if (hasTestimonials) passed++;
    
    console.groupEnd();
    return { passed, total };
}

/**
 * Test Suite: FAQ Section
 * Verifies that FAQ section exists and is properly structured
 */
function testFAQSection() {
    console.group('Testing FAQ Section');
    let passed = 0;
    let total = 0;
    
    // Test 1: FAQ section exists
    total++;
    const faqSection = document.getElementById('faq');
    const hasFaq = !!faqSection;
    logTest('FAQ section exists', hasFaq);
    if (hasFaq) passed++;
    
    if (!hasFaq) {
        console.groupEnd();
        return { passed, total };
    }
    
    // Test 2: Has multiple FAQ items
    total++;
    const faqItems = faqSection.querySelectorAll('.bg-white.p-6.rounded-lg.shadow-md');
    const hasFaqItems = faqItems.length >= 3;
    logTest('At least 3 FAQ items exist', hasFaqItems, faqItems.length + ' FAQ items found');
    if (hasFaqItems) passed++;
    
    // Test 3: Each FAQ has a question and answer
    total++;
    let validStructure = true;
    
    for (let i = 0; i < faqItems.length; i++) {
        const question = faqItems[i].querySelector('h3');
        const answer = faqItems[i].querySelector('p');
        
        if (!question || !answer) {
            validStructure = false;
            break;
        }
    }
    
    logTest('All FAQs have question and answer format', validStructure);
    if (validStructure) passed++;
    
    console.groupEnd();
    return { passed, total };
}

/**
 * Test Suite: Counters
 * Tests if the counter animation functions are working
 */
function testCounters() {
    console.group('Testing Counter Functionality');
    let passed = 0;
    let total = 0;
    
    // Test 1: Counter animation function exists
    total++;
    const hasAnimateCounters = typeof animateCounters === 'function';
    logTest('animateCounters function exists', hasAnimateCounters);
    if (hasAnimateCounters) passed++;
    
    // Test 2: Counter element exists
    total++;
    const counterElement = document.getElementById('users-counter');
    const hasCounterElement = !!counterElement;
    logTest('Counter element exists in DOM', hasCounterElement);
    if (hasCounterElement) passed++;
    
    // Test 3: Counter has a value
    total++;
    const counterHasValue = hasCounterElement && counterElement.textContent.trim() !== '';
    logTest('Counter has a value', counterHasValue, counterElement ? counterElement.textContent : null);
    if (counterHasValue) passed++;
    
    console.groupEnd();
    return { passed, total };
}

/**
 * Test Suite: Navigation
 * Verifies that all navigation links work correctly
 */
function testNavigation() {
    console.group('Testing Navigation');
    let passed = 0;
    let total = 0;
    
    // Test 1: Navigation bar exists
    total++;
    const navbar = document.querySelector('nav');
    const hasNavbar = !!navbar;
    logTest('Navigation bar exists', hasNavbar);
    if (hasNavbar) passed++;
    
    // Test 2: Has links to all major sections
    total++;
    const requiredLinks = ['home', 'about', 'faq', 'contact'];
    const existingLinks = Array.from(document.querySelectorAll('nav a')).map(a => 
        a.getAttribute('href')?.replace('#', '')
    );
    
    let allLinksExist = true;
    for (const link of requiredLinks) {
        if (!existingLinks.includes(link)) {
            allLinksExist = false;
            console.warn(`Missing navigation link: ${link}`);
        }
    }
    
    logTest('All required section links exist', allLinksExist);
    if (allLinksExist) passed++;
    
    // Test 3: Has My Results link
    total++;
    const myResultsLink = document.getElementById('my-results-link');
    const hasMyResultsLink = !!myResultsLink;
    logTest('My Results link exists', hasMyResultsLink);
    if (hasMyResultsLink) passed++;
    
    console.groupEnd();
    return { passed, total };
}

/**
 * Helper function to log test results
 */
function logTest(description, passed, value = null) {
    const icon = passed ? '✅' : '❌';
    const color = passed ? 'color: green' : 'color: red';
    
    if (SEO_TEST_CONFIG.logLevel === 'error' && passed) {
        return;
    }
    
    if (SEO_TEST_CONFIG.logLevel === 'warn' && passed && !value) {
        return;
    }
    
    console.log(`${icon} %c${description}`, color, value !== null ? ' → ' + value : '');
}

// Run tests if configured to do so
if (SEO_TEST_CONFIG.runOnLoad) {
    document.addEventListener('DOMContentLoaded', function() {
        // Wait a bit for any dynamic elements to load
        setTimeout(runSEOTests, 1000);
    });
}

// Export test functions for manual testing
window.SEOTests = {
    runAll: runSEOTests,
    testMetaTags,
    testSchemaMarkup,
    testSocialProofSection,
    testFAQSection,
    testCounters,
    testNavigation
}; 