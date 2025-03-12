/**
 * Financial Personality Types
 * Maps financial bias scores to personality archetypes
 */

// Define the 4 financial personality types with their characteristics
const FINANCIAL_PERSONALITY_TYPES = {
  GUARDIAN: {
    id: "guardian",
    name: "The Guardian",
    description: "You are cautious and security-focused, prioritizing the protection of your assets over aggressive growth. This disciplined approach helps you avoid major losses, but might cause you to miss some growth opportunities.",
    strengths: ["Risk-aware", "Disciplined", "Patient", "Detail-oriented"],
    weaknesses: ["May miss growth opportunities", "Excessive worry", "Decision paralysis"],
    colorScheme: "#3b82f6", // blue
    icon: "shield"
  },
  OPTIMIZER: {
    id: "optimizer",
    name: "The Optimizer",
    description: "You are analytical and methodical, seeking the maximum return with calculated risks. Your research-driven approach helps you find efficiency, but might lead to overthinking or analysis paralysis.",
    strengths: ["Analytical", "Research-driven", "Logical", "Thorough"],
    weaknesses: ["Overthinking", "Perfectionism", "Slow decision-making"],
    colorScheme: "#8b5cf6", // purple
    icon: "graph"
  },
  VISIONARY: {
    id: "visionary",
    name: "The Visionary",
    description: "You are growth-focused and opportunity-seeking, willing to take bold risks for potentially high returns. Your forward-thinking approach creates growth opportunities, but might expose you to higher volatility.",
    strengths: ["Forward-thinking", "Growth-oriented", "Bold", "Adaptable"],
    weaknesses: ["Potential overconfidence", "Volatility exposure", "Impatience"],
    colorScheme: "#ef4444", // red
    icon: "rocket"
  },
  FOLLOWER: {
    id: "follower",
    name: "The Follower",
    description: "You are trend-sensitive and socially-influenced, often making decisions based on what others are doing or recent market movements. This keeps you in tune with market sentiment, but might lead to chasing trends too late.",
    strengths: ["Socially aware", "Adaptive", "Trend-conscious", "Collaborative"],
    weaknesses: ["FOMO-driven decisions", "Bandwagon investing", "Recency-influenced"],
    colorScheme: "#10b981", // green
    icon: "users"
  }
};

/**
 * Maps bias scores to financial personality types
 * @param {Array} biasResults - The array of bias objects with scores
 * @return {Object} Personality type results with primary and secondary types
 */
function determineFinancialPersonalityType(biasResults) {
  if (!biasResults || !Array.isArray(biasResults) || biasResults.length === 0) {
    console.error("Invalid bias results provided to personality mapper");
    return null;
  }
  
  // Create a map of bias scores for easy lookup
  const biasMap = {};
  biasResults.forEach(bias => {
    biasMap[bias.bias || bias.id] = bias.score;
  });
  
  console.log("Mapping biases to personality type:", biasMap);
  
  // Calculate coordinates on our 2D personality grid
  // X-axis: Risk tolerance (negative = cautious, positive = bold)
  // Y-axis: Decision style (negative = analytical, positive = intuitive)
  const xAxis = calculateXAxisPosition(biasMap);
  const yAxis = calculateYAxisPosition(biasMap);
  
  console.log("Personality coordinates:", { x: xAxis, y: yAxis });
  
  // Determine which quadrant the user falls into
  let primaryType = determineQuadrant(xAxis, yAxis);
  
  // Calculate percentage match to each type
  const matchPercentages = calculateTypePercentages(xAxis, yAxis);
  
  // Find secondary type (second highest percentage)
  const secondaryType = determineSecondaryType(matchPercentages, primaryType);
  
  return {
    primaryType: FINANCIAL_PERSONALITY_TYPES[primaryType],
    secondaryType: FINANCIAL_PERSONALITY_TYPES[secondaryType],
    matchPercentages,
    coordinates: { x: xAxis, y: yAxis }
  };
}

// Helper functions for the algorithm
function calculateXAxisPosition(biasMap) {
  // Risk tolerance calculation based on biases
  // Positive values indicate risk-seeking behavior
  let xPosition = 0;
  
  // Loss aversion (negative impact on risk tolerance)
  if (biasMap.lossAversion) {
    xPosition -= biasMap.lossAversion * 0.8;
  }
  
  // Overconfidence (positive impact on risk tolerance)
  if (biasMap.overconfidence) {
    xPosition += biasMap.overconfidence * 0.7;
  }
  
  // Normalize to -10 to +10 range
  return Math.max(-10, Math.min(10, xPosition));
}

function calculateYAxisPosition(biasMap) {
  // Decision style: analytical vs. intuitive/social
  let yPosition = 0;
  
  // Anchoring (analytical approach)
  if (biasMap.anchoring) {
    yPosition -= biasMap.anchoring * 0.6;
  }
  
  // Herd mentality (intuitive/social approach)
  if (biasMap.herdMentality) {
    yPosition += biasMap.herdMentality * 0.8;
  }
  
  // Recency bias (intuitive)
  if (biasMap.recencyBias) {
    yPosition += biasMap.recencyBias * 0.5;
  }
  
  // Normalize to -10 to +10 range
  return Math.max(-10, Math.min(10, yPosition));
}

function determineQuadrant(x, y) {
  // Map coordinates to personality types
  if (x < 0 && y < 0) return "GUARDIAN";     // Cautious & Analytical
  if (x < 0 && y >= 0) return "FOLLOWER";    // Cautious & Intuitive
  if (x >= 0 && y < 0) return "OPTIMIZER";   // Bold & Analytical
  return "VISIONARY";                        // Bold & Intuitive
}

function calculateTypePercentages(x, y) {
  // Calculate distance from center of each quadrant
  // and convert to percentage match
  const normalizedX = (x + 10) / 20; // 0 to 1
  const normalizedY = (y + 10) / 20; // 0 to 1
  
  // Calculate percentage match to each type
  return {
    GUARDIAN: Math.round((1 - normalizedX) * (1 - normalizedY) * 100),
    FOLLOWER: Math.round((1 - normalizedX) * normalizedY * 100),
    OPTIMIZER: Math.round(normalizedX * (1 - normalizedY) * 100),
    VISIONARY: Math.round(normalizedX * normalizedY * 100)
  };
}

function determineSecondaryType(percentages, primaryType) {
  // Create array without primary type
  const types = Object.keys(percentages).filter(type => type !== primaryType);
  
  // Find type with highest percentage
  return types.reduce((a, b) => percentages[a] > percentages[b] ? a : b);
}

// Make available globally
window.FINANCIAL_PERSONALITY_TYPES = FINANCIAL_PERSONALITY_TYPES;
window.determineFinancialPersonalityType = determineFinancialPersonalityType; 