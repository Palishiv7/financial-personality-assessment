// Custom function to fix overlapping in bias cards
function drawFixedBiasCard(doc, name, score, description, effects, y, margin, contentWidth, colors, fonts) {
    // Set up card dimensions with improved spacing
    const cardMargin = 8;
    const titleHeight = 30; // Increased for better spacing
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
    
    // Measure description text with improved spacing
    const descMaxWidth = contentWidth - (cardMargin * 6);
    const descLines = doc.splitTextToSize(description, descMaxWidth);
    const descHeight = descLines.length * 7 + 15; // Better line height
    
    // Calculate effects height with improved spacing
    let effectsHeight = 0;
    let effectLines = [];
    if (effects) {
        effectLines = doc.splitTextToSize(effects, descMaxWidth);
        effectsHeight = effectLines.length * 7 + 25; // Better spacing for effects section
    }
    
    // Calculate total content height with proper spacing
    contentHeight = titleHeight + descHeight + effectsHeight + (cardMargin * 4);
    
    // Create shadow effect
    doc.setFillColor(100, 100, 100, 0.08);
    doc.roundedRect(margin + 3, y + 3, contentWidth, contentHeight, 3, 3, 'F');
    
    // Draw card background with gradient
    const grd = doc.setGradient("axial", 
        margin, y,
        margin, y + contentHeight,
        [[0, 'F8FAFC'], [1, 'FFFFFF']]
    );
    
    doc.setFillColor(grd);
    doc.roundedRect(margin, y, contentWidth, contentHeight, 3, 3, 'F');
    
    // Add styled border
    doc.setDrawColor(color[0], color[1], color[2], 0.5);
    doc.setLineWidth(0.7);
    doc.roundedRect(margin, y, contentWidth, contentHeight, 3, 3, 'D');
    
    // Draw left color bar
    const indicatorWidth = 6;
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(margin, y, indicatorWidth, contentHeight, 'F');
    
    // Add title area with subtle background
    doc.setFillColor(color[0], color[1], color[2], 0.08);
    doc.rect(margin + indicatorWidth, y, contentWidth - indicatorWidth, titleHeight, 'F');
    
    // Add title with proper positioning
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text(name, margin + indicatorWidth + 12, y + 16);
    
    // Add severity in parentheses
    const nameWidth = doc.getTextWidth(name);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(`(${severityText})`, margin + indicatorWidth + nameWidth + 20, y + 16);
    
    // Add score label and value
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(`Score: ${score.toFixed(1)}/10`, margin + indicatorWidth + 12, y + 26);
    
    // Draw score bar
    const scoreBarX = margin + indicatorWidth + 60;
    const scoreBarY = y + 24;
    const scoreBarWidth = 80;
    const scoreBarHeight = 4;
    
    // Score background
    doc.setFillColor(220, 220, 220);
    doc.roundedRect(scoreBarX, scoreBarY, scoreBarWidth, scoreBarHeight, 2, 2, 'F');
    
    // Filled portion
    const filledWidth = Math.max((score / 10) * scoreBarWidth, 6);
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(scoreBarX, scoreBarY, filledWidth, scoreBarHeight, 2, 2, 'F');
    
    // Add description with proper spacing
    const descY = y + titleHeight + 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text(descLines, margin + indicatorWidth + 12, descY);
    
    // Add financial impact section if available
    if (effects) {
        const impactY = descY + descHeight + 5;
        
        // Draw impact section background
        doc.setFillColor(color[0], color[1], color[2], 0.05);
        doc.roundedRect(margin + 15, impactY - 8, contentWidth - 30, effectsHeight - 5, 3, 3, 'F');
        
        // Add impact heading
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text('Financial Impact:', margin + 25, impactY);
        
        // Add impact text with proper spacing
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.text(effectLines, margin + 25, impactY + 10);
    }
    
    // Return position after this card plus extra spacing
    return y + contentHeight + 15;
} 