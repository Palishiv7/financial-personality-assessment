#!/bin/bash
# Ultra-minimal launcher for Financial Debiasing Advisor
# Zero dependencies, maximum compatibility, ready to go viral!

# Define port
PORT=6969

echo "===== Financial Debiasing Advisor ====="
echo "Running on http://localhost:$PORT"

# Use python3 explicitly
PYTHON="python3"

# Try to launch browser (non-blocking)
(sleep 1 && 
 (open http://localhost:$PORT 2>/dev/null || 
  xdg-open http://localhost:$PORT 2>/dev/null || 
  start http://localhost:$PORT 2>/dev/null || 
  echo "Open http://localhost:$PORT in your browser")) &

# Start server - one simple command
$PYTHON -m http.server $PORT 