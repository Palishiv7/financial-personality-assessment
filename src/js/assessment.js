/**
 * Assessment Module
 * Handles the financial bias assessment process
 */

// State variables for assessment
let currentQuestionIndex = 0;
let userAnswers = [];
let assessmentResults = null;
let assessmentStartTime = null;

// DOM Elements
const assessmentSection = document.getElementById('assessment-section');
const questionContainer = document.getElementById('question-container');
const prevButton = document.getElementById('prev-question');
const nextButton = document.getElementById('next-question');
const resultsSection = document.getElementById('results-section');
const biasResultsContainer = document.getElementById('bias-results');
const debiasingStrategiesContainer = document.getElementById('debiasing-strategies');
const startAssessmentButton = document.getElementById('start-assessment');
const startDecisionToolButton = document.getElementById('start-decision-tool');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const progressPercent = document.getElementById('progress-percent');
const progressTracker = document.getElementById('progress-tracker');
const progressTrackerText = document.getElementById('progress-tracker-text');
const submitButton = document.getElementById('submit-assessment-button');
const submitContainer = document.getElementById('submit-assessment-container');

// Initialize the assessment module
function initAssessment() {
    console.log("Initializing assessment module");
    
    // Reset the state
    currentQuestionIndex = 0;
    userAnswers = [];
    assessmentResults = null;
    
    // Check for saved progress in localStorage
    if (localStorage.getItem('fda_assessment_progress')) {
        try {
            const savedProgress = JSON.parse(localStorage.getItem('fda_assessment_progress'));
            if (savedProgress.answers && Array.isArray(savedProgress.answers)) {
                userAnswers = savedProgress.answers;
                console.log("Loaded saved answers:", userAnswers);
            }
            if (savedProgress.currentQuestionIndex !== undefined && savedProgress.currentQuestionIndex < ASSESSMENT_QUESTIONS.length) {
                currentQuestionIndex = savedProgress.currentQuestionIndex;
                console.log("Loaded saved question index:", currentQuestionIndex);
            }
        } catch (error) {
            console.error("Error loading saved progress:", error);
        }
    }
    
    // Add event listeners
    if (startAssessmentButton) {
        startAssessmentButton.addEventListener('click', startAssessment);
    }
    
    if (prevButton) {
        prevButton.addEventListener('click', handlePrevButtonClick);
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', handleNextButtonClick);
    }
    
    // Handle the submit button - using multiple approaches for reliability
    if (submitButton) {
        console.log("Adding event listener to submit button");
        // Clear any existing event listeners
        submitButton.replaceWith(submitButton.cloneNode(true));
        
        // Get fresh reference after replacing
        const freshSubmitButton = document.getElementById('submit-assessment-button');
        
        if (freshSubmitButton) {
            // Add event listener
            freshSubmitButton.addEventListener('click', handleSubmitButtonClick);
            
            // Also add an onclick attribute as a backup
            freshSubmitButton.setAttribute('onclick', 'handleSubmitButtonClick()');
            
            console.log("Submit button configured:", freshSubmitButton);
        } else {
            console.error("Failed to get fresh reference to submit button");
        }
    } else {
        console.error("Submit button not found in the DOM");
    }
    
    if (startDecisionToolButton) {
        startDecisionToolButton.addEventListener('click', () => {
            window.location.hash = 'decision-tool';
        });
    }
    
    // Check if we're on the assessment section based on URL hash
    if (window.location.hash === '#assessment') {
        startAssessment();
    }
}

// Start the assessment process
function startAssessment() {
    console.log('Starting assessment at:', new Date().toISOString());
    
    // Record start time
    assessmentStartTime = new Date();
    
    // Reset state
    resetAssessmentState();
    
    // Show the assessment section if not already visible
    if (assessmentSection && assessmentSection.classList.contains('hidden')) {
        console.log('Making assessment section visible from assessment.js');
        assessmentSection.classList.remove('hidden');
        assessmentSection.style.display = 'block';
    }
    
    // Show the question container and set up the first question
    if (questionContainer) {
        console.log('Question container found, making it visible');
        questionContainer.classList.remove('hidden');
        questionContainer.style.display = 'block';
        
        // Show the first question
        showQuestion(0);
        
        // Get the header height to use as offset
        const headerHeight = document.querySelector('header')?.offsetHeight || 80;
        
        // Scroll to the question with proper offset for fixed header
        window.scrollTo({
            top: questionContainer.offsetTop - headerHeight - 20, // Extra 20px padding
            behavior: 'auto' // No smooth scrolling on mobile to prevent flickering
        });
        
        // Show progress tracker
        showProgressTracker();
    } else {
        console.error('Question container not found in startAssessment');
    }
}

// Display a specific question by index
function showQuestion(index) {
    console.log(`Attempting to show question at index ${index}`);
    
    // Validate index and required elements
    if (!questionContainer || !ASSESSMENT_QUESTIONS) {
        console.error("Missing required elements or question data");
        return;
    }
    
    if (index < 0 || index >= ASSESSMENT_QUESTIONS.length) {
        console.error(`Invalid question index: ${index}. Valid range: 0 to ${ASSESSMENT_QUESTIONS.length - 1}`);
        return;
    }
    
    // Check if assessment has been completed previously
    const hasCompletedAssessment = getFromLocalStorage('fda_completed_assessment') === 'true';
    const hasNavigatedToResults = window.location.hash === '#results';
    
    // If assessment was completed and user is trying to navigate to results, 
    // don't show the question, show results instead
    if (hasCompletedAssessment && hasNavigatedToResults) {
        console.log("Assessment already completed and results requested - redirecting to results");
        
        if (typeof showResultsSection === 'function') {
            showResultsSection();
        } else if (window.location.hash !== '#results') {
            window.location.hash = '#results';
        }
        return;
    }
    
    // Update current index
    currentQuestionIndex = index;
    const question = ASSESSMENT_QUESTIONS[index];
    
    if (!question) {
        console.error(`No question found at index ${index}`);
        return;
    }
    
    console.log(`Showing question ${index + 1}/${ASSESSMENT_QUESTIONS.length} (ID: ${question.id})`);
    
    // Check if viewing on small/medium sized device
    const isMobileDevice = window.innerWidth <= 428;
    const mobileClass = isMobileDevice ? 'text-wrap' : '';
    
    // Create the question HTML
    let questionHTML = `
        <div class="mb-6 fade-in">
            <h4 class="text-xl font-semibold text-gray-800 mb-4 ${mobileClass}">${question.text}</h4>
            <div class="space-y-3" id="options-container">
    `;
    
    // Add options
    question.options.forEach(option => {
        const isSelected = userAnswers.some(a => a.questionId === question.id && a.selectedOptionId === option.id);
        const selectedClass = isSelected ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50';
        
        questionHTML += `
            <div class="option-container ${selectedClass} p-3 border rounded cursor-pointer transition duration-200"
                 data-option-id="${option.id}" data-question-id="${question.id}">
                <label class="flex items-start cursor-pointer w-full">
                    <input type="radio" name="question-${question.id}" value="${option.id}" class="mr-2 mt-1" ${isSelected ? 'checked' : ''}>
                    <span class="${mobileClass}">${option.text}</span>
                </label>
            </div>
        `;
    });
    
    questionHTML += `
            </div>
        </div>
    `;
    
    // Update the question container
    questionContainer.innerHTML = questionHTML;
    
    // Update progress indicators
    updateProgress(index, ASSESSMENT_QUESTIONS.length);
    
    // Add event listeners to options
    attachOptionEventListeners();
    
    // Update navigation buttons
    updateNavigationButtons();
    
    // Force layout refresh on mobile
    if (isMobileDevice) {
        setTimeout(() => {
            // Apply additional mobile-specific adjustments
            const optionContainers = document.querySelectorAll('.option-container');
            optionContainers.forEach(container => {
                container.style.width = '100%';
                container.style.boxSizing = 'border-box';
                
                // Ensure the radio button and text are properly aligned
                const label = container.querySelector('label');
                if (label) {
                    label.style.alignItems = 'flex-start';
                }
                
                // Make the text properly wrap
                const span = container.querySelector('span');
                if (span) {
                    span.style.wordBreak = 'break-word';
                    span.style.overflowWrap = 'break-word';
                    span.style.hyphens = 'auto';
                    span.style.display = 'inline-block';
                }
            });
        }, 50);
    }
}

// Attach event listeners to option containers
function attachOptionEventListeners() {
    document.querySelectorAll('.option-container').forEach(container => {
        container.addEventListener('click', function(e) {
            const optionId = this.dataset.optionId;
            const questionId = parseInt(this.dataset.questionId);
            
            console.log(`Option clicked: questionId=${questionId}, optionId=${optionId}`);
            
            // Find and check the radio button
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
            
            // Save the answer
            saveAnswer(questionId, optionId);
            
            // Update UI
            document.querySelectorAll('.option-container').forEach(c => {
                c.classList.remove('bg-blue-50', 'border-blue-500');
                c.classList.add('hover:bg-gray-50');
            });
            
            this.classList.add('bg-blue-50', 'border-blue-500');
            this.classList.remove('hover:bg-gray-50');
            
            // Enable the next button
            enableNextButton();
        });
    });
}

// Enable the next button
function enableNextButton() {
    if (nextButton) {
        nextButton.disabled = false;
        nextButton.classList.remove('opacity-50', 'cursor-not-allowed');
        nextButton.classList.add('hover:bg-blue-600');
    }
}

// Update progress indicators
function updateProgress(currentIndex, totalQuestions) {
    if (!progressBar || !progressText || !progressPercent) return;
    
    const percent = Math.round((currentIndex / (totalQuestions - 1)) * 100);
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `Question ${currentIndex + 1} of ${totalQuestions}`;
    progressPercent.textContent = `${percent}%`;
    
    // Add appropriate color based on progress
    progressBar.classList.remove('bg-blue-600', 'bg-yellow-500', 'bg-green-600');
    if (percent < 33) {
        progressBar.classList.add('bg-blue-600');
    } else if (percent < 66) {
        progressBar.classList.add('bg-yellow-500');
    } else {
        progressBar.classList.add('bg-green-600');
    }
    
    // Update progress tracker in header
    updateProgressTracker(currentIndex + 1, totalQuestions);
}

// Save an answer
function saveAnswer(questionId, selectedOptionId) {
    console.log(`Saving answer: questionId=${questionId}, selectedOptionId=${selectedOptionId}`);
    
    // Remove any existing answer for this question
    userAnswers = userAnswers.filter(answer => answer.questionId !== questionId);
    
    // Add the new answer
    userAnswers.push({
        questionId: questionId,
        selectedOptionId: selectedOptionId,
        timestamp: new Date().toISOString()
    });
    
    console.log('Updated answers:', userAnswers);
    
    // Save progress to localStorage
    try {
        localStorage.setItem('fda_assessment_progress', JSON.stringify(userAnswers));
    } catch (error) {
        console.error("Error saving progress:", error);
    }
}

// Handle previous button click
function handlePrevButtonClick() {
    console.log("Previous button clicked");
    
    if (currentQuestionIndex > 0) {
        showQuestion(currentQuestionIndex - 1);
    }
}

// Handle next button click
function handleNextButtonClick() {
    console.log("Next button clicked");
    
    const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];
    
    // Check if this question has been answered
    const hasAnswer = userAnswers.some(a => a.questionId === currentQuestion.id);
    
    // Check if we're in a test environment
    const isTestEnvironment = window.testSuite !== undefined || window.isTestEnvironment === true;
    
    // Require an answer unless in test environment
    if (!hasAnswer && !isTestEnvironment) {
        alert('Please select an option before proceeding.');
        return;
    }
    
    // If this is the last question, complete the assessment
    if (currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1) {
        completeAssessment();
    } else {
        // Otherwise show the next question
        showQuestion(currentQuestionIndex + 1);
    }
}

// Update navigation buttons based on current state
function updateNavigationButtons() {
    console.log(`Updating navigation buttons for question ${currentQuestionIndex + 1}`);
    
    // Handle previous button visibility
    if (prevButton) {
        if (currentQuestionIndex === 0) {
            prevButton.classList.add('hidden');
        } else {
            prevButton.classList.remove('hidden');
        }
    }
    
    // Update next button text
    if (nextButton) {
        if (currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1) {
            nextButton.textContent = 'Complete Assessment';
        } else {
            nextButton.textContent = 'Next';
        }
        
        // Check if current question has an answer
        const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];
        const hasAnswer = userAnswers.some(a => a.questionId === currentQuestion.id);
        
        // Enable/disable button based on answer status
        nextButton.disabled = !hasAnswer;
        
        if (hasAnswer) {
            nextButton.classList.remove('opacity-50', 'cursor-not-allowed');
            nextButton.classList.add('hover:bg-blue-600');
        } else {
            nextButton.classList.add('opacity-50', 'cursor-not-allowed');
            nextButton.classList.remove('hover:bg-blue-600');
        }
    }
    
    // Show/hide submit button on last question
    if (submitContainer) {
        if (currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1) {
            submitContainer.classList.remove('hidden');
            
            // Re-initialize the submit button when it becomes visible
            const visibleSubmitButton = document.getElementById('submit-assessment-button');
            if (visibleSubmitButton) {
                console.log("Re-initializing visible submit button");
                visibleSubmitButton.addEventListener('click', handleSubmitButtonClick);
                visibleSubmitButton.setAttribute('onclick', 'handleSubmitButtonClick()');
            }
        } else {
            submitContainer.classList.add('hidden');
        }
    }
}

// Complete the assessment and show results
function completeAssessment() {
    console.log("Completing assessment - direct call");
    
    // Check if all questions are answered
    const unansweredQuestions = [];
    
    ASSESSMENT_QUESTIONS.forEach((question, index) => {
        if (!userAnswers.some(a => a.questionId === question.id)) {
            unansweredQuestions.push(index + 1); // 1-based for display
        }
    });
    
    // Require all questions to be answered unless in test mode
    const isTestMode = window.testSuite !== undefined || window.isTestEnvironment === true;
    
    if (unansweredQuestions.length > 0 && !isTestMode) {
        alert(`Please answer all questions before completing the assessment. Missing questions: ${unansweredQuestions.join(', ')}`);
        
        // Navigate to the first unanswered question
        if (unansweredQuestions.length > 0) {
            showQuestion(unansweredQuestions[0] - 1); // Convert back to 0-based
        }
        
        return;
    }
    
    // Calculate assessment duration
    let durationInSeconds = null;
    if (assessmentStartTime) {
        const endTime = new Date();
        durationInSeconds = Math.round((endTime - assessmentStartTime) / 1000);
    }
    
    // Calculate results
    try {
        console.log("About to calculate bias scores with answers:", userAnswers);
        
        // Verify questions.js is loaded
        if (typeof ASSESSMENT_QUESTIONS === 'undefined') {
            console.error("ASSESSMENT_QUESTIONS is not defined. Check that questions.js is loaded.");
            alert("There was an error loading the questions. Please refresh and try again.");
            return;
        }
        
        // Verify biases.js is loaded
        if (typeof FINANCIAL_BIASES === 'undefined') {
            console.error("FINANCIAL_BIASES is not defined. Check that biases.js is loaded.");
            alert("There was an error loading the bias definitions. Please refresh and try again.");
            return;
        }
        
        // Verify calculateBiasScores is available
        if (typeof calculateBiasScores !== 'function') {
            // Try to define it if it's not available
            if (typeof window.calculateBiasScores === 'function') {
                calculateBiasScores = window.calculateBiasScores;
            } else {
                console.error("calculateBiasScores function not found!");
                alert("Sorry, we encountered an error calculating your results. Please try again.");
                return;
            }
        }
        
        // Calculate the bias scores
        assessmentResults = calculateBiasScores(userAnswers);
        console.log("Calculated assessment results:", assessmentResults);
        
        // Mark assessment as completed and save results
        localStorage.setItem('fda_completed_assessment', 'true');
        localStorage.setItem('fda_assessment_completion_time', new Date().toISOString());
        
        // Save bias profile for other features
        localStorage.setItem('fda_user_biases', JSON.stringify(assessmentResults));
        
        // Update results links visibility in navigation
        if (typeof updateResultsLinksVisibility === 'function') {
            updateResultsLinksVisibility(true);
        }
        
        // Reset assessment state
        currentQuestionIndex = 0;
        
        // Reset assessment progress in localStorage to ensure future assessments start fresh
        localStorage.removeItem('fda_assessment_progress');
        
        // Manually hide assessment section
        if (assessmentSection) {
            assessmentSection.classList.add('hidden');
            assessmentSection.style.display = 'none';
            console.log("Assessment section hidden directly");
        }
        
        // Manually show results section
        if (resultsSection) {
            resultsSection.classList.remove('hidden');
            resultsSection.style.display = 'block';
            console.log("Results section shown directly");
            
            // Set the hash without triggering the hashchange event
            try {
                history.pushState(null, null, '#results');
                console.log("URL hash updated to #results without triggering hashchange");
            } catch (e) {
                console.error("Failed to update URL hash:", e);
            }
        }
        
        // Display results
        console.log("Calling displayResults with:", assessmentResults, durationInSeconds);
        displayResults(assessmentResults, durationInSeconds);
        
        // Make sure results section is scrolled into view
        if (resultsSection) {
            setTimeout(() => {
                resultsSection.scrollIntoView({behavior: 'smooth'});
                console.log("Scrolled to results section");
            }, 100);
        }
        
        // Track completion
        if (typeof trackEngagement === 'function') {
            trackEngagement('assessment_completed', {
                duration: durationInSeconds,
                questionCount: ASSESSMENT_QUESTIONS.length,
                topBias: assessmentResults.length > 0 ? assessmentResults[0].bias : null
            });
        }
        
        return true;
    } catch (error) {
        console.error("Error calculating results:", error);
        alert("There was an error calculating your results. Please try again.\n\nError: " + error.message);
        return false;
    }
}

// Display the assessment results
function displayResults(results, durationInSeconds = null) {
    console.log("Displaying assessment results:", results);
    
    // Make sure we have valid results
    if (!results || !Array.isArray(results) || results.length === 0) {
        console.error("Invalid results received in displayResults:", results);
        alert("There was an error with your results. Please try again.");
        return;
    }
    
    // Hide assessment section
    if (assessmentSection) {
        console.log("Hiding assessment section");
        assessmentSection.classList.add('hidden');
    } else {
        console.error("Assessment section element not found");
    }
    
    // Show results section
    if (!resultsSection) {
        console.error("Results section element not found");
        alert("The results section could not be found. Please refresh the page and try again.");
        return;
    }
    
    console.log("Showing results section");
    resultsSection.classList.remove('hidden');
    
    // Update URL hash
    window.location.hash = 'results';
    
    // Scroll to results with offset for fixed header
    const headerHeight = document.querySelector('header')?.offsetHeight || 80;
    window.scrollTo({
        top: resultsSection.offsetTop - headerHeight - 20, // Extra 20px padding
        behavior: 'auto' // No smooth scrolling on mobile to prevent flickering
    });
    
    // Create the bias profile visualization
    if (!biasResultsContainer) {
        console.error("Bias results container element not found");
        return;
    }
    
    console.log("Creating bias profile visualization");
    
    // Clear any existing content
    biasResultsContainer.innerHTML = '';
    
    // Sort biases by score descending
    const sortedBiases = [...results].sort((a, b) => b.score - a.score);
    console.log("Sorted biases for display:", sortedBiases);
    
    // Calculate personality type if the function is available
    if (typeof determineFinancialPersonalityType === 'function') {
        try {
            console.log("Determining financial personality type from biases");
            const personalityResult = determineFinancialPersonalityType(results);
            displayPersonality(personalityResult);
        } catch (e) {
            console.error("Error determining financial personality type:", e);
        }
    } else {
        console.warn("determineFinancialPersonalityType function not available");
    }
    
    // Section 1: Financial Personality 
    // (This section already exists and is displayed by displayPersonality function)
    
    // Section 2: NEW - Financial Blind Spots Analysis
    displayBlindSpotAnalysis(sortedBiases);
    
    // Section 3: Bias Visualization (existing)
    // Create the bias profile chart
    const biasProfileEl = document.createElement('div');
    biasProfileEl.className = 'my-8';
    biasProfileEl.innerHTML = `
        <h3 class="text-xl font-semibold mb-4">Your Financial Bias Profile</h3>
        <div class="grid gap-4">
            ${sortedBiases.map(bias => {
                const scoreClass = scoreToColorClass(bias.score);
                return `
                    <div class="bg-white rounded-lg p-4 shadow-md">
                        <div class="flex justify-between items-center mb-2">
                            <h4 class="font-medium text-lg">${bias.name}</h4>
                            <span class="text-sm font-medium ${scoreClass} px-2 py-1 rounded-full">${bias.score}/10</span>
                        </div>
                        <p class="text-gray-600 mb-2">${bias.description}</p>
                        <p class="text-gray-700"><strong>Effect:</strong> ${bias.effects}</p>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    biasResultsContainer.appendChild(biasProfileEl);
    
    // Section 4: Debiasing Strategies (existing)
    // Top biases for debiasing strategies
    const topBiases = sortedBiases.slice(0, 3);
    
    // Create a container for debiasing strategies
    const strategiesEl = document.createElement('div');
    strategiesEl.className = 'my-8';
    
    // Generate HTML for debiasing strategies
    strategiesEl.innerHTML = `
        <h3 class="text-xl font-semibold mb-4">Your Personalized Debiasing Strategies</h3>
        <p class="mb-4">Based on your bias profile, here are strategies to help you make better financial decisions:</p>
        <div class="grid gap-4">
            ${topBiases.map(bias => {
                // Get strategies for this bias
                const strategies = getDebiasingStrategies(bias.id);
                
                return `
                    <div class="bg-white rounded-lg p-4 shadow-md">
                        <h4 class="font-medium text-lg mb-2">For ${bias.name}:</h4>
                        <ul class="list-disc pl-5 space-y-2">
                            ${strategies.map(strategy => `
                                <li>
                                    <strong>${strategy.name}:</strong> ${strategy.description}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    biasResultsContainer.appendChild(strategiesEl);
    
    // Section 5: Show completion time 
    if (durationInSeconds) {
        const completionTimeEl = document.createElement('div');
        completionTimeEl.className = 'text-center mt-8 text-gray-600 text-sm';
        
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;
        const timeString = minutes > 0 
            ? `${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}`
            : `${seconds} second${seconds !== 1 ? 's' : ''}`;
            
        completionTimeEl.textContent = `Assessment completed in ${timeString}`;
        biasResultsContainer.appendChild(completionTimeEl);
    }
    
    // Add a retake button if needed
    addRetakeButton();
    
    // Initialize the feedback form if the function exists
    if (typeof initFeedbackForm === 'function') {
        initFeedbackForm();
    }
    
    // Track this view
    if (typeof trackEngagement === 'function') {
        trackEngagement('view_results');
    }
}

// NEW FUNCTION: Display the blind spot analysis
function displayBlindSpotAnalysis(biases) {
    console.log("Displaying blind spot analysis for biases:", biases);
    
    // Get the blind spot analysis
    const blindSpotAnalysis = typeof getBlindSpotAnalysis === 'function' 
        ? getBlindSpotAnalysis(biases, 3) 
        : [];
    
    if (!blindSpotAnalysis || blindSpotAnalysis.length === 0) {
        console.warn("No blind spot analysis available");
        return;
    }
    
    console.log("Blind spot analysis:", blindSpotAnalysis);
    
    // Create container for blind spot analysis
    const blindSpotContainer = document.createElement('div');
    blindSpotContainer.className = 'my-12 bg-gray-50 p-6 rounded-xl shadow-md';
    
    // Create heading with dramatic reveal effect
    blindSpotContainer.innerHTML = `
        <div class="text-center mb-6">
            <h3 class="text-2xl font-bold mb-2 text-blue-800">Your Financial Blind Spots Revealed</h3>
            <p class="text-gray-600">We've identified specific financial blind spots that may be affecting your wealth-building potential.</p>
        </div>
    `;
    
    // Create each blind spot card with animation
    const blindSpotCardsContainer = document.createElement('div');
    blindSpotCardsContainer.className = 'space-y-6';
    
    blindSpotAnalysis.forEach((blindSpot, index) => {
        const delay = index * 0.2; // Staggered animation delay
        
        const blindSpotCard = document.createElement('div');
        blindSpotCard.className = `bg-white rounded-lg p-6 shadow-md border-l-4 fade-in-up`;
        blindSpotCard.style.animationDelay = `${delay}s`;
        blindSpotCard.style.borderLeftColor = getBiasColor(blindSpot.biasScore);
        
        blindSpotCard.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <h4 class="text-xl font-semibold">${blindSpot.biasName} Blind Spot</h4>
                <span class="px-3 py-1 rounded-full text-white text-sm font-medium" 
                      style="background-color: ${getBiasColor(blindSpot.biasScore)}">
                    ${blindSpot.severity}
                </span>
            </div>
            
            <p class="text-lg font-medium mb-4 text-gray-800">${blindSpot.shortDescription}</p>
            
            <div class="mb-4">
                <h5 class="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">DETAILED ANALYSIS</h5>
                <p class="text-gray-700">${blindSpot.detailedAnalysis}</p>
            </div>
            
            <div class="mb-4">
                <h5 class="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">FINANCIAL IMPACT</h5>
                <p class="text-gray-700">${blindSpot.financialImpact}</p>
            </div>
            
            <div class="mb-4">
                <h5 class="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">HOW THIS AFFECTS YOU</h5>
                <p class="text-gray-700">${blindSpot.realWorldExample}</p>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-100">
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                    </svg>
                    <p class="text-sm text-gray-500"><strong>Research Note:</strong> ${blindSpot.statistics}</p>
                </div>
            </div>
        `;
        
        blindSpotCardsContainer.appendChild(blindSpotCard);
    });
    
    blindSpotContainer.appendChild(blindSpotCardsContainer);
    
    // Add a callout with shocking statistic to drive impact
    const shockingStatistic = document.createElement('div');
    shockingStatistic.className = 'mt-8 p-4 bg-blue-800 text-white rounded-lg shadow-lg text-center';
    shockingStatistic.innerHTML = `
        <p class="text-lg font-medium">These blind spots could be costing you thousands in missed opportunities.</p>
        <p class="text-sm mt-2">Studies show that addressing these blind spots can improve financial performance by 1.5-4% annually.</p>
    `;
    
    blindSpotContainer.appendChild(shockingStatistic);
    
    // Insert the blind spot analysis after the personality section
    const personalitySection = document.querySelector('.personality-result');
    if (personalitySection) {
        personalitySection.parentNode.insertBefore(blindSpotContainer, personalitySection.nextSibling);
    } else {
        biasResultsContainer.insertBefore(blindSpotContainer, biasResultsContainer.firstChild);
    }
}

// Helper function to get color based on bias score
function getBiasColor(score) {
    if (score >= 8) return '#ef4444'; // Red for very high
    if (score >= 6) return '#f97316'; // Orange for high
    if (score >= 4) return '#eab308'; // Yellow for moderate
    if (score >= 2) return '#22c55e'; // Green for low
    return '#3b82f6'; // Blue for very low
}

// Convert score to color class for progress bars
function scoreToColorClass(score) {
    if (score >= 8) return 'bg-red-600';
    if (score >= 6) return 'bg-orange-500';
    if (score >= 4) return 'bg-yellow-500';
    if (score >= 2) return 'bg-blue-500';
    return 'bg-green-500';
}

// Get debiasing strategies for a specific bias
function getDebiasingStrategies(biasType) {
    console.log("Getting strategies for bias type:", biasType);
    
    // Check if we can access the FINANCIAL_BIASES object
    if (typeof FINANCIAL_BIASES !== 'object') {
        console.error("FINANCIAL_BIASES object is not available");
        return [];
    }
    
    // Try to get strategies from the FINANCIAL_BIASES object first
    if (FINANCIAL_BIASES[biasType] && Array.isArray(FINANCIAL_BIASES[biasType].strategies)) {
        console.log("Found strategies in FINANCIAL_BIASES:", FINANCIAL_BIASES[biasType].strategies);
        return FINANCIAL_BIASES[biasType].strategies;
    }
    
    // Fallback to hardcoded strategies if the bias type is known
    const fallbackStrategies = {
        lossAversion: [
            {
                name: "Reframe the Decision",
                description: "Instead of focusing on potential losses, reframe decisions in terms of opportunity costs or long-term goals."
            },
            {
                name: "Pre-commit to a Decision Rule",
                description: "Create rules in advance for when you'll sell investments (e.g., 'If it drops 15%, I'll reevaluate')."
            },
            {
                name: "Broaden Your Perspective",
                description: "Consider your entire portfolio rather than focusing on individual investments."
            }
        ],
        anchoring: [
            {
                name: "Use Multiple Reference Points",
                description: "Consider various metrics and valuation methods rather than fixating on a single number."
            },
            {
                name: "Start with a Blank Slate",
                description: "Periodically reevaluate investments as if you were considering them for the first time."
            },
            {
                name: "Get Third-Party Perspective",
                description: "Ask what advice you would give to someone else in your exact situation."
            }
        ],
        overconfidence: [
            {
                name: "Conduct a Premortem",
                description: "Before making a decision, imagine it failed and think about potential reasons why."
            },
            {
                name: "Seek Out Opposing Views",
                description: "Actively look for information that contradicts your current beliefs about an investment."
            },
            {
                name: "Track Your Prediction Accuracy",
                description: "Keep a record of your financial predictions and regularly check their accuracy."
            }
        ],
        recencyBias: [
            {
                name: "Examine Historical Data",
                description: "Actively look at long-term performance data and market cycles before making decisions."
            },
            {
                name: "Implement Automatic Rebalancing",
                description: "Set up periodic portfolio rebalancing to avoid being swayed by recent market trends."
            },
            {
                name: "Keep a Decision Journal",
                description: "Document your investment decisions and the reasoning behind them to review later."
            }
        ],
        herdMentality: [
            {
                name: "Conduct Independent Research",
                description: "Research investments yourself rather than relying on what's popular or recommended by others."
            },
            {
                name: "Consider Contrarian Viewpoints",
                description: "When everyone is excited about an investment, consider reasons for caution and vice versa."
            },
            {
                name: "Use Automated Investing",
                description: "Set up regular, automatic investments to avoid being influenced by market sentiment."
            }
        ]
    };
    
    if (fallbackStrategies[biasType]) {
        console.log("Using fallback strategies for", biasType);
        return fallbackStrategies[biasType];
    }
    
    console.warn("No strategies found for bias type:", biasType);
    return [];
}

// Function to retake the assessment
function retakeAssessment() {
    // Clear previous results
    userAnswers = [];
    currentQuestionIndex = 0;
    
    // Remove saved progress
    try {
        localStorage.removeItem('fda_assessment_progress');
    } catch (e) {
        console.error("Error clearing saved progress:", e);
    }
    
    // Start fresh assessment
    startAssessment();
}

// Show the decision tool
function showDecisionTool() {
    const decisionToolSection = document.getElementById('decision-tool-section');
    if (!decisionToolSection) return;
    
    // Show decision tool section
    decisionToolSection.classList.remove('hidden');
    decisionToolSection.classList.add('fade-in');
    decisionToolSection.scrollIntoView({ behavior: 'smooth' });
    
    // Initialize decision tool with assessment results
    if (typeof initDecisionTool === 'function') {
        initDecisionTool(assessmentResults || {});
    }
}

// Show the progress tracker in the header
function showProgressTracker() {
    // Completely disabled to prevent overlap with navigation
    // The progress is already shown in the assessment section
    return;
    
    /* Original code commented out
    if (!progressTracker || !progressTrackerText) return;
    
    // Instead of removing hidden class, we'll use our CSS visibility transition
    progressTracker.classList.remove('hidden');
    
    // Make sure it's properly positioned
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    if (mobileMenuButton && window.innerWidth < 768) {
        const buttonRect = mobileMenuButton.getBoundingClientRect();
        progressTracker.style.right = (window.innerWidth - buttonRect.left + 16) + 'px';
    }
    
    updateProgressTracker(1, ASSESSMENT_QUESTIONS.length);
    */
}

// Update the progress tracker in the header
function updateProgressTracker(current, total) {
    // Completely disabled to prevent overlap with navigation
    // The progress is already shown in the assessment section
    return;
    
    /* Original code commented out
    if (!progressTracker || !progressTrackerText) return;
    
    // Update text
    progressTrackerText.textContent = `Assessment: ${current}/${total}`;
    
    // Get progress level
    const progress = current / total;
    
    // Update color based on progress
    progressTracker.classList.remove('bg-blue-500', 'bg-yellow-500', 'bg-green-500');
    
    if (progress < 0.3) {
        progressTracker.classList.add('bg-blue-500');
    } else if (progress < 0.7) {
        progressTracker.classList.add('bg-yellow-500');
    } else if (progress < 1) {
        progressTracker.classList.add('bg-green-500');
    } else {
        // Completed
        progressTracker.classList.add('bg-green-500');
        
        // Show completion message
        progressTrackerText.textContent = 'Assessment Completed!';
    }
    
    // Log for debugging
    console.log(`Progress updated: ${current}/${total}`);
    */
}

// Function to handle the submission button click
function handleSubmitButtonClick() {
    console.log("Submit button clicked");
    
    // Check if the current question has been answered
    const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];
    const hasAnswer = userAnswers.some(a => a.questionId === currentQuestion.id);
    
    if (!hasAnswer) {
        alert('Please select an option before submitting.');
        return;
    }
    
    // Call completeAssessment directly
    completeAssessment();
}

// Make the functions globally accessible for debugging
window.completeAssessment = completeAssessment;
window.displayResults = displayResults;
window.handleSubmitButtonClick = handleSubmitButtonClick;

// Reset assessment state for a fresh start
function resetAssessmentState() {
    console.log("Resetting assessment state");
    
    // Reset state variables
    currentQuestionIndex = 0;
    userAnswers = [];
    assessmentResults = null;
    assessmentStartTime = null;
    
    // Remove in-progress assessment data
    localStorage.removeItem('fda_assessment_progress');
    
    // Make available to window for external modules
    if (!window.resetAssessmentState) {
        window.resetAssessmentState = resetAssessmentState;
    }
}

// Make functions available globally
window.initAssessment = initAssessment;
window.startAssessment = startAssessment;
window.calculateBiasScores = calculateBiasScores;
window.completeAssessment = completeAssessment;
window.displayResults = displayResults;
window.handleSubmitButtonClick = handleSubmitButtonClick;
window.resetAssessmentState = resetAssessmentState;

// NEW FUNCTION: Display the personality type results
function displayPersonality(personalityResult) {
    if (!personalityResult || !typeof generatePersonalityTypeHTML === 'function') {
        console.error("Invalid personality result or missing generation function");
        return;
    }
    
    try {
        // Add personality type section first (new feature highlight)
        const personalityTypeHTML = generatePersonalityTypeHTML(personalityResult);
        biasResultsContainer.innerHTML = personalityTypeHTML;
        
        // Save personality type result to localStorage
        localStorage.setItem('fda_personality_type', JSON.stringify(personalityResult));
        
        // Add a divider
        const divider = document.createElement('div');
        divider.className = 'border-t border-gray-200 my-10';
        biasResultsContainer.appendChild(divider);
        
        // Add a heading for the next sections
        const biasHeader = document.createElement('div');
        biasHeader.className = 'text-center mb-8';
        biasHeader.innerHTML = `
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Your Financial Analysis</h3>
            <p class="text-gray-600">We've analyzed your financial decision-making patterns in detail</p>
        `;
        biasResultsContainer.appendChild(biasHeader);
    } catch (error) {
        console.error("Error displaying personality type:", error);
    }
}

// Helper function to add retake button
function addRetakeButton() {
    // Create action buttons container
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'flex flex-wrap justify-center gap-4 mt-8';
    
    // Retake button
    const retakeButton = document.createElement('button');
    retakeButton.id = 'retake-assessment';
    retakeButton.className = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg transition duration-300 flex items-center justify-center';
    retakeButton.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        Retake Assessment
    `;
    retakeButton.addEventListener('click', retakeAssessment);
    
    // Add buttons to the container
    actionsDiv.appendChild(retakeButton);
    
    // Add to results container
    biasResultsContainer.appendChild(actionsDiv);
} 