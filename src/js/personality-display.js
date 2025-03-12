/**
 * Financial Personality Display Module
 * Renders the personality type UI components
 */

/**
 * Generates HTML for displaying the financial personality type results
 * @param {Object} personalityResult - The personality type result object
 * @return {string} HTML string for the personality type display
 */
function generatePersonalityTypeHTML(personalityResult) {
  if (!personalityResult || !personalityResult.primaryType) {
    console.error("Unable to generate personality HTML - invalid data:", personalityResult);
    return '<p class="text-red-500">Unable to determine personality type</p>';
  }
  
  const { primaryType, secondaryType, matchPercentages, coordinates } = personalityResult;
  
  console.log("Generating personality display for:", primaryType.name);
  
  // Generate HTML for the personality type display
  return `
    <div class="personality-result fade-in-up">
      <div class="text-center mb-8">
        <p class="text-gray-600">Understanding how you naturally approach financial decisions</p>
      </div>
      
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div class="flex flex-col md:flex-row items-center">
          <div class="rounded-full p-4 mr-4 mb-4 md:mb-0 flex-shrink-0" style="background-color: ${primaryType.colorScheme}30">
            <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: ${primaryType.colorScheme}">
              ${getIconSVG(primaryType.icon)}
            </svg>
          </div>
          <div>
            <h4 class="text-2xl font-bold mb-2" style="color: ${primaryType.colorScheme}">${primaryType.name}</h4>
            <p class="text-gray-700 mb-4">${primaryType.description}</p>
            <p class="text-gray-500">Secondary influence: <span class="font-medium" style="color: ${secondaryType.colorScheme}">${secondaryType.name}</span></p>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <!-- Type breakdown card -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h4 class="text-lg font-semibold mb-4">Your Type Breakdown</h4>
          <div class="space-y-4">
            ${Object.keys(matchPercentages).map(type => `
              <div>
                <div class="flex justify-between mb-1">
                  <span class="font-medium" style="color: ${FINANCIAL_PERSONALITY_TYPES[type].colorScheme}">
                    ${FINANCIAL_PERSONALITY_TYPES[type].name}
                  </span>
                  <span>${matchPercentages[type]}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="h-2 rounded-full" 
                       style="width: ${matchPercentages[type]}%; background-color: ${FINANCIAL_PERSONALITY_TYPES[type].colorScheme}"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Strengths and weaknesses -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h4 class="text-lg font-semibold mb-4">Key Traits</h4>
          
          <h5 class="font-medium text-green-600 mb-2">Your Strengths</h5>
          <ul class="list-disc pl-5 mb-4 space-y-1">
            ${primaryType.strengths.map(strength => `
              <li>${strength}</li>
            `).join('')}
          </ul>
          
          <h5 class="font-medium text-red-600 mb-2">Potential Blind Spots</h5>
          <ul class="list-disc pl-5 space-y-1">
            ${primaryType.weaknesses.map(weakness => `
              <li>${weakness}</li>
            `).join('')}
          </ul>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h4 class="text-lg font-semibold mb-4">How to Optimize Your Financial Approach</h4>
        <p class="text-gray-700 mb-4">
          As a <span class="font-medium" style="color: ${primaryType.colorScheme}">${primaryType.name}</span>, 
          you can improve your financial decision-making by being aware of your natural tendencies and 
          making adjustments when needed.
        </p>
        
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <h5 class="font-semibold text-blue-700 mb-2">Leverage Your Strengths</h5>
          <p class="text-blue-700">
            ${getStrengthsAdvice(primaryType.id)}
          </p>
        </div>
        
        <div class="bg-amber-50 border-l-4 border-amber-500 p-4">
          <h5 class="font-semibold text-amber-700 mb-2">Watch Out For</h5>
          <p class="text-amber-700">
            ${getWeaknessesAdvice(primaryType.id)}
          </p>
        </div>
      </div>
      
      <div class="text-center mt-8">
        <button id="take-personality-test-again" onclick="window.location.hash='assessment'" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg transition duration-300 mr-4">
          Take the Test Again
        </button>
        <button id="share-personality-results" class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg transition duration-300">
          Share Your Type
        </button>
      </div>
    </div>
  `;
}

/**
 * Returns SVG path for the given icon
 */
function getIconSVG(iconName) {
  const icons = {
    shield: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />',
    graph: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />',
    rocket: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />',
    users: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />'
  };
  
  return icons[iconName] || '';
}

/**
 * Returns advice for leveraging strengths based on personality type
 */
function getStrengthsAdvice(typeId) {
  const advice = {
    guardian: "Continue to focus on security and risk management, but consider allocating a small portion of your portfolio to higher-growth opportunities that you've thoroughly researched.",
    optimizer: "Your analytical approach serves you well. Consider setting time limits for research to avoid analysis paralysis, and develop rules for when to execute decisions.",
    visionary: "Your ability to spot opportunities and take calculated risks is valuable. Consider pairing with a financial advisor who can help provide structure and risk management to your approach.",
    follower: "Your awareness of market trends and social dynamics can be valuable. Develop a system to validate trends with objective data before investing."
  };
  
  return advice[typeId] || "Leverage your natural financial tendencies while staying balanced in your approach.";
}

/**
 * Returns advice for managing weaknesses based on personality type
 */
function getWeaknessesAdvice(typeId) {
  const advice = {
    guardian: "You might be leaving growth opportunities on the table. Consider dollar-cost averaging into investments to reduce the anxiety of timing decisions.",
    optimizer: "Don't let the perfect be the enemy of the good. Set deadlines for making decisions to avoid missing opportunities while searching for the perfect investment.",
    visionary: "Your confidence may sometimes become overconfidence. Implement a mandatory cooling-off period for major financial decisions, and consider the downside scenarios.",
    follower: "Watch out for acting on FOMO (fear of missing out). Create a personal investment checklist that any opportunity must pass, regardless of what others are doing."
  };
  
  return advice[typeId] || "Be mindful of your potential blind spots when making financial decisions.";
}

/**
 * Renders personality map on canvas
 */
function renderPersonalityMap(coordinates, containerId = 'personality-map') {
  // Implementation would go here - a simple quadrant visualization
  console.log("Would render personality map with coordinates:", coordinates);
  
  // Placeholder - in real implementation, this would create a canvas visualization
  // of the quadrant system with the user's position marked
}

/**
 * Adds social sharing functionality
 */
function setupSocialSharing() {
  const shareButton = document.getElementById('share-personality-results');
  if (shareButton) {
    shareButton.addEventListener('click', () => {
      // Implementation of sharing functionality
      alert("Sharing is not implemented in this demo");
    });
  }
}

/**
 * Initializes the personality display
 */
function initPersonalityDisplay() {
  // Event listeners and initialization code
  console.log("Personality display module initialized");
}

// Make functions available globally
window.generatePersonalityTypeHTML = generatePersonalityTypeHTML;
window.renderPersonalityMap = renderPersonalityMap;
window.initPersonalityDisplay = initPersonalityDisplay; 