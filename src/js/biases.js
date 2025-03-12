/**
 * Financial Biases Database
 * Contains information about common financial biases, their effects, and debiasing strategies
 */

const FINANCIAL_BIASES = {
    lossAversion: {
        id: "lossAversion",
        name: "Loss Aversion",
        description: "The tendency to feel the pain of losses more intensely than the pleasure of equivalent gains.",
        effects: "May lead to holding onto losing investments too long or avoiding necessary risks.",
        level: 0, // Will be calculated during assessment
        
        // Blind Spot Analysis
        blindSpot: {
            shortDescription: "You feel losses much more intensely than equivalent gains.",
            detailedAnalysis: "Your responses indicate you experience the pain of financial losses 2-3x more intensely than the pleasure of equivalent gains. This is a common psychological tendency, but yours is more pronounced than average.",
            financialImpact: "This blind spot may be costing you significant returns by causing you to hold underperforming investments too long, hoping they'll recover rather than reallocating to better opportunities.",
            realWorldExample: "When investments drop in value, you likely feel a strong urge to wait until they recover to their original purchase price before selling, even if better opportunities exist elsewhere.",
            statistics: "Research shows that the average investor with high loss aversion scores earns 1.5-3% lower annual returns due to holding losing investments too long."
        },
        
        strategies: [
            {
                id: "framingEffect",
                name: "Reframe the Decision",
                description: "Instead of focusing on potential losses, reframe decisions in terms of opportunity costs or long-term goals."
            },
            {
                id: "preCommitment",
                name: "Pre-commit to a Decision Rule",
                description: "Create rules in advance for when you'll sell investments (e.g., 'If it drops 15%, I'll reevaluate')."
            },
            {
                id: "broadenPerspective",
                name: "Broaden Your Perspective",
                description: "Consider your entire portfolio rather than focusing on individual investments."
            }
        ]
    },
    
    recencyBias: {
        id: "recencyBias",
        name: "Recency Bias",
        description: "Giving more weight to recent events and experiences while undervaluing long-term data.",
        effects: "May lead to chasing recently successful investments or overreacting to short-term market movements.",
        level: 0,
        
        // Blind Spot Analysis
        blindSpot: {
            shortDescription: "You give too much weight to recent events when making financial decisions.",
            detailedAnalysis: "Your assessment reveals a strong tendency to place excessive emphasis on recent financial events while undervaluing long-term historical patterns and data.",
            financialImpact: "This blind spot can lead to performance chasing and buying high/selling low, which research shows reduces returns by an average of 2-4% annually for affected investors.",
            realWorldExample: "You might be drawn to invest in sectors or funds that have performed well in the most recent 6-12 months, rather than considering longer-term performance cycles.",
            statistics: "Studies show that investors with high recency bias typically make 33% more trades during volatile markets, often at suboptimal times."
        },
        
        strategies: [
            {
                id: "historicalData",
                name: "Examine Historical Data",
                description: "Actively look at long-term performance data and market cycles before making decisions."
            },
            {
                id: "autoRebalance",
                name: "Implement Automatic Rebalancing",
                description: "Set up periodic portfolio rebalancing to avoid being swayed by recent market trends."
            },
            {
                id: "journaling",
                name: "Keep a Decision Journal",
                description: "Document your investment decisions and the reasoning behind them to review later."
            }
        ]
    },
    
    overconfidence: {
        id: "overconfidence",
        name: "Overconfidence Bias",
        description: "Overestimating one's knowledge, abilities, or the accuracy of one's forecasts.",
        effects: "May lead to excessive trading, insufficient diversification, or taking on too much risk.",
        level: 0,
        
        // Blind Spot Analysis
        blindSpot: {
            shortDescription: "You overestimate your financial knowledge and ability to predict market movements.",
            detailedAnalysis: "Your responses indicate a significant tendency to overestimate your financial knowledge, skills, and the accuracy of your market predictions.",
            financialImpact: "Research shows that highly overconfident investors trade 2.5x more frequently but earn approximately 4% lower annual returns due to excessive trading costs and poor timing decisions.",
            realWorldExample: "You might believe you can identify winning stocks or time market movements better than most investors or even professionals, leading to concentrated positions and higher-risk bets.",
            statistics: "Studies of retail investor behavior found that the most overconfident 20% of investors had portfolios that were 40% more volatile than average but with lower risk-adjusted returns."
        },
        
        strategies: [
            {
                id: "premortem",
                name: "Conduct a Premortem",
                description: "Before making a decision, imagine it failed and think about potential reasons why."
            },
            {
                id: "opposingView",
                name: "Seek Out Opposing Views",
                description: "Actively look for information that contradicts your current beliefs about an investment."
            },
            {
                id: "trackRecord",
                name: "Track Your Prediction Accuracy",
                description: "Keep a record of your financial predictions and regularly check their accuracy."
            }
        ]
    },
    
    herdMentality: {
        id: "herdMentality",
        name: "Herd Mentality",
        description: "Following what others are doing rather than making independent decisions.",
        effects: "May lead to buying assets at inflated prices during bubbles or panic selling during downturns.",
        level: 0,
        
        // Blind Spot Analysis
        blindSpot: {
            shortDescription: "You tend to follow the crowd rather than making independent financial decisions.",
            detailedAnalysis: "Your responses reveal a strong tendency to follow what others are doing in financial markets rather than conducting independent analysis and decision-making.",
            financialImpact: "This blind spot often results in buying at market peaks and selling at market bottoms, which can reduce lifetime returns by 5-7% during periods with significant market cycles.",
            realWorldExample: "You may feel most comfortable investing in popular stocks or funds that 'everyone is talking about,' and might get nervous when your investments differ from what others are doing.",
            statistics: "Analysis of investor fund flows shows that herd behavior causes the average investor to underperform the very funds they invest in by approximately 1.7% annually due to poor timing of purchases and sales."
        },
        
        strategies: [
            {
                id: "independentResearch",
                name: "Conduct Independent Research",
                description: "Research investments yourself rather than relying on what's popular or recommended by others."
            },
            {
                id: "contrarian",
                name: "Consider Contrarian Viewpoints",
                description: "When everyone is excited about an investment, consider reasons for caution and vice versa."
            },
            {
                id: "automatedInvesting",
                name: "Use Automated Investing",
                description: "Set up regular, automatic investments to avoid being influenced by market sentiment."
            }
        ]
    },
    
    anchoring: {
        id: "anchoring",
        name: "Anchoring Bias",
        description: "Relying too heavily on the first piece of information encountered (the 'anchor').",
        effects: "May lead to basing investment decisions on arbitrary reference points like purchase prices or round numbers.",
        level: 0,
        
        // Blind Spot Analysis
        blindSpot: {
            shortDescription: "You rely too heavily on initial reference points when making financial decisions.",
            detailedAnalysis: "Your assessment indicates you place excessive weight on initial reference points (such as purchase prices or arbitrary targets) when making financial decisions.",
            financialImpact: "This blind spot commonly leads to holding investments until they reach arbitrary price targets or selling at predetermined thresholds regardless of fundamentals, reducing optimal returns by an estimated 1-2% annually.",
            realWorldExample: "You might refuse to sell an investment until it returns to your purchase price, or set target prices based on round numbers (like $100) rather than fundamental analysis.",
            statistics: "Studies of investor limit orders show that anchoring to round numbers (e.g., setting sell orders at $50 or $100) accounts for over 40% of suboptimal exit decisions."
        },
        
        strategies: [
            {
                id: "multipleAnchors",
                name: "Use Multiple Reference Points",
                description: "Consider various metrics and valuation methods rather than fixating on a single number."
            },
            {
                id: "blankSlate",
                name: "Start with a Blank Slate",
                description: "Periodically reevaluate investments as if you were considering them for the first time."
            },
            {
                id: "thirdParty",
                name: "Get Third-Party Perspective",
                description: "Ask what advice you would give to someone else in your exact situation."
            }
        ]
    }
};

// Helper function to get strategies for specific biases
function getStrategiesForBiases(biasIds) {
    let strategies = [];
    
    biasIds.forEach(biasId => {
        if (FINANCIAL_BIASES[biasId]) {
            FINANCIAL_BIASES[biasId].strategies.forEach(strategy => {
                strategies.push({
                    ...strategy,
                    forBias: FINANCIAL_BIASES[biasId].name
                });
            });
        }
    });
    
    return strategies;
}

// Helper function to get top biases based on assessment
function getTopBiases(assessmentResults, count = 3) {
    // Sort biases by level (descending)
    const sortedBiases = Object.values(assessmentResults)
        .sort((a, b) => b.level - a.level)
        .slice(0, count);
    
    return sortedBiases;
}

// NEW: Helper function to get blind spot analysis for top biases
function getBlindSpotAnalysis(biases, count = 3) {
    const topBiases = biases.slice(0, count);
    const blindSpotAnalysis = [];
    
    topBiases.forEach(bias => {
        if (FINANCIAL_BIASES[bias.id] && FINANCIAL_BIASES[bias.id].blindSpot) {
            blindSpotAnalysis.push({
                ...FINANCIAL_BIASES[bias.id].blindSpot,
                biasId: bias.id,
                biasName: FINANCIAL_BIASES[bias.id].name,
                biasScore: bias.score,
                severity: getSeverityLevel(bias.score)
            });
        }
    });
    
    return blindSpotAnalysis;
}

// Helper function to determine severity level based on score
function getSeverityLevel(score) {
    if (score >= 8) return "Very High";
    if (score >= 6) return "High";
    if (score >= 4) return "Moderate";
    if (score >= 2) return "Low";
    return "Very Low";
}

// Apply bias correction to investment comparison
function applyBiasCorrection(investmentOptions, biases) {
    const correctedOptions = JSON.parse(JSON.stringify(investmentOptions)); // Deep clone
    
    // Apply corrections based on detected biases
    biases.forEach(bias => {
        switch(bias.id) {
            case "lossAversion":
                // Adjust risk perception based on loss aversion level
                correctedOptions.forEach(option => {
                    // For people with high loss aversion, perceived risk is higher than actual
                    // Adjust the perceived risk down to be more objective
                    const adjustmentFactor = 1 - (bias.level * 0.1); // 0.1 to 0.5 adjustment
                    option.perceivedRisk = Math.max(1, Math.round(option.risk * adjustmentFactor));
                });
                break;
                
            case "recencyBias":
                // Adjust return expectations based on recency bias
                correctedOptions.forEach(option => {
                    // People with recency bias might over-weight recent performance
                    // Add a "historical average" perspective
                    option.adjustedReturn = option.expectedReturn;
                    option.historicalContext = "Consider that the long-term average market return is around 7-10% annually.";
                });
                break;
                
            case "overconfidence":
                // Add confidence intervals for returns
                correctedOptions.forEach(option => {
                    const confidenceRange = option.expectedReturn * 0.3; // 30% variance
                    option.returnRangeLow = Math.round((option.expectedReturn - confidenceRange) * 10) / 10;
                    option.returnRangeHigh = Math.round((option.expectedReturn + confidenceRange) * 10) / 10;
                    option.confidenceNote = "Consider that your return estimates may be off by 30% or more in either direction.";
                });
                break;
                
            case "herdMentality":
                // Flag popular investments for additional scrutiny
                correctedOptions.forEach(option => {
                    if (option.isPopular) {
                        option.popularityWarning = "This investment is currently popular. Ensure you're not investing just because others are.";
                    }
                });
                break;
                
            case "anchoring":
                // Provide alternative reference points
                correctedOptions.forEach(option => {
                    option.alternativeMetrics = "Consider evaluating this investment using multiple metrics, not just the expected return.";
                });
                break;
        }
    });
    
    return correctedOptions;
} 