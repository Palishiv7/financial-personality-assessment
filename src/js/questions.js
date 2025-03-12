/**
 * Financial Bias Assessment Questions
 * A set of questions designed to identify common financial biases
 */

const ASSESSMENT_QUESTIONS = [
    {
        id: 1,
        text: "You bought a stock for $100, and it's now worth $80. What are you most likely to do?",
        options: [
            { id: "a", text: "Sell it immediately to prevent further losses", score: { lossAversion: 1 } },
            { id: "b", text: "Hold it until it gets back to $100 before selling", score: { lossAversion: 3, anchoring: 3 } },
            { id: "c", text: "Buy more if you still believe in the company", score: { lossAversion: 1 } },
            { id: "d", text: "Hold indefinitely because you don't want to realize the loss", score: { lossAversion: 5 } }
        ]
    },
    {
        id: 2,
        text: "Which investment approach appeals to you most?",
        options: [
            { id: "a", text: "Investing in whatever performed best last year", score: { recencyBias: 5, herdMentality: 3 } },
            { id: "b", text: "Investing in whatever Warren Buffett is buying", score: { herdMentality: 4 } },
            { id: "c", text: "Following a fixed asset allocation regardless of market conditions", score: { recencyBias: 1, herdMentality: 1 } },
            { id: "d", text: "Investing based on what you predict will happen in the economy", score: { overconfidence: 4 } }
        ]
    },
    {
        id: 3,
        text: "How confident are you in your ability to pick investments that will outperform the market?",
        options: [
            { id: "a", text: "Very confident - I have special insight or skills", score: { overconfidence: 5 } },
            { id: "b", text: "Somewhat confident - I can do better than average", score: { overconfidence: 3 } },
            { id: "c", text: "Not very confident - it's difficult to beat the market consistently", score: { overconfidence: 1 } },
            { id: "d", text: "Not at all confident - I prefer index funds", score: { overconfidence: 0 } }
        ]
    },
    {
        id: 4,
        text: "You hear that a cryptocurrency has risen 50% in the last month. What's your reaction?",
        options: [
            { id: "a", text: "I should buy now before it goes up even more", score: { recencyBias: 5, herdMentality: 4 } },
            { id: "b", text: "I'm curious but want to research why it's rising first", score: { recencyBias: 2, herdMentality: 1 } },
            { id: "c", text: "It's probably too late to buy now", score: { recencyBias: 3, anchoring: 3 } },
            { id: "d", text: "Short-term price movements don't affect my long-term strategy", score: { recencyBias: 0, herdMentality: 0 } }
        ]
    },
    {
        id: 5,
        text: "Which statement best describes your reaction to market downturns?",
        options: [
            { id: "a", text: "I get anxious and consider selling my investments", score: { lossAversion: 4 } },
            { id: "b", text: "I don't worry because markets always recover eventually", score: { overconfidence: 2 } },
            { id: "c", text: "I see it as an opportunity to buy more at lower prices", score: { lossAversion: 1 } },
            { id: "d", text: "I avoid checking my portfolio during downturns", score: { lossAversion: 3 } }
        ]
    },
    {
        id: 6,
        text: "Which factor most influences your decision to buy a specific stock?",
        options: [
            { id: "a", text: "Many people I know are buying it", score: { herdMentality: 5 } },
            { id: "b", text: "Its recent performance has been excellent", score: { recencyBias: 4 } },
            { id: "c", text: "My analysis of its fundamentals and future prospects", score: { overconfidence: 3, herdMentality: 0 } },
            { id: "d", text: "I rarely buy individual stocks", score: { herdMentality: 0, overconfidence: 1 } }
        ]
    },
    {
        id: 7,
        text: "If you bought a stock at $50 and it rose to $75, what price would make you consider selling?",
        options: [
            { id: "a", text: "$100 (a nice round number)", score: { anchoring: 4 } },
            { id: "b", text: "$100 (double my purchase price)", score: { anchoring: 5 } },
            { id: "c", text: "I'd reassess based on its current fundamentals, not a specific price", score: { anchoring: 0 } },
            { id: "d", text: "I'd sell part now to lock in some gains", score: { lossAversion: 3 } }
        ]
    },
    {
        id: 8,
        text: "How do you feel about investments that have declined in value?",
        options: [
            { id: "a", text: "I feel worse about losses than I feel good about equivalent gains", score: { lossAversion: 4 } },
            { id: "b", text: "I view them as potential opportunities if the fundamentals are still sound", score: { lossAversion: 1 } },
            { id: "c", text: "I avoid looking at investments that are down", score: { lossAversion: 5 } },
            { id: "d", text: "I automatically add more if they drop a certain percentage", score: { anchoring: 3 } }
        ]
    },
    {
        id: 9,
        text: "What's most likely to make you sell an investment?",
        options: [
            { id: "a", text: "Everyone else seems to be selling", score: { herdMentality: 5 } },
            { id: "b", text: "It's down 20% from what I paid", score: { anchoring: 4, lossAversion: 2 } },
            { id: "c", text: "Recent news suggests problems with the investment", score: { recencyBias: 3 } },
            { id: "d", text: "It no longer fits my investment strategy or goals", score: { herdMentality: 0, anchoring: 0 } }
        ]
    },
    {
        id: 10,
        text: "Which statement best describes your investment philosophy?",
        options: [
            { id: "a", text: "I have a unique approach that gives me an edge over others", score: { overconfidence: 5 } },
            { id: "b", text: "I follow proven strategies used by successful investors", score: { herdMentality: 3, overconfidence: 1 } },
            { id: "c", text: "I stick to simple, diversified investments with low fees", score: { overconfidence: 0, herdMentality: 1 } },
            { id: "d", text: "I try to predict market trends and invest accordingly", score: { overconfidence: 4, recencyBias: 3 } }
        ]
    }
];

// Calculate bias scores from answers
function calculateBiasScores(answers) {
    console.log("Calculating bias scores from answers:", answers);
    
    // Deep clone the FINANCIAL_BIASES object to avoid modifying the original
    const biasesObj = {};
    
    // Copy all properties from FINANCIAL_BIASES to our working object
    for (const biasKey in FINANCIAL_BIASES) {
        // Create a fresh copy to avoid referencing the original object
        biasesObj[biasKey] = JSON.parse(JSON.stringify(FINANCIAL_BIASES[biasKey])); 
        // Set the score property (overwrite level if it exists)
        biasesObj[biasKey].score = 0; 
        // Ensure id is set
        biasesObj[biasKey].id = biasKey;
    }
    
    console.log("Initialized biases:", biasesObj);
    
    // Calculate raw scores
    answers.forEach(answer => {
        const question = ASSESSMENT_QUESTIONS.find(q => q.id === answer.questionId);
        if (!question) {
            console.warn("Question not found:", answer.questionId);
            return;
        }
        
        const selectedOption = question.options.find(o => o.id === answer.selectedOptionId);
        if (!selectedOption) {
            console.warn("Option not found:", answer.selectedOptionId);
            return;
        }
        
        console.log(`Processing answer for question ${question.id}, option ${selectedOption.id}`);
        
        // Add scores for each bias affected by this answer
        for (const bias in selectedOption.score) {
            if (biasesObj[bias]) {
                const points = selectedOption.score[bias];
                biasesObj[bias].score += points;
                console.log(`Added ${points} points to ${bias}, now ${biasesObj[bias].score}`);
            }
        }
    });
    
    // Normalize scores to a 0-10 scale
    // Maximum possible score for each bias (if all questions gave max points to this bias)
    const maxPossibleScores = {
        lossAversion: 25,
        recencyBias: 20,
        overconfidence: 20,
        herdMentality: 20,
        anchoring: 15
    };
    
    for (const bias in biasesObj) {
        if (maxPossibleScores[bias]) {
            // Normalize to 0-10 scale and round to nearest integer
            const normalizedScore = Math.round((biasesObj[bias].score / maxPossibleScores[bias]) * 10);
            biasesObj[bias].score = normalizedScore;
            console.log(`Normalized ${bias} score to ${normalizedScore}/10`);
        }
    }
    
    // Convert to array and sort by score (highest first)
    const biasesArray = Object.values(biasesObj).sort((a, b) => b.score - a.score);
    
    console.log("Final calculated bias results:", biasesArray);
    
    return biasesArray;
} 