#!/bin/bash
# Launch script for Financial Debiasing Advisor

# Function to check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Determine script directory for reliable execution
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

echo "======================================"
echo "  Financial Debiasing Advisor Launcher"
echo "======================================"
echo

# Find the Python command
if command_exists python3; then
    PYTHON_CMD="python3"
elif command_exists python; then
    # Check Python version
    PY_VERSION=$(python --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1)
    if [ "$PY_VERSION" -lt "3" ]; then
        echo "Error: Python 3 is required but Python $PY_VERSION was found."
        echo "Please install Python 3 and try again."
        exit 1
    fi
    PYTHON_CMD="python"
else
    echo "Error: Python not found. Please install Python 3."
    exit 1
fi

echo "Using Python command: $PYTHON_CMD"

# Check if the server file exists
if [ ! -f "server.py" ]; then
    echo "Error: server.py not found in current directory."
    echo "Current directory: $(pwd)"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Make server.py executable if it's not already
if [ ! -x "server.py" ]; then
    echo "Making server.py executable..."
    chmod +x server.py
fi

# Kill any existing server processes
echo "Checking for existing servers on port 6969..."
if command_exists lsof; then
    SERVER_PID=$(lsof -ti:6969)
    if [ ! -z "$SERVER_PID" ]; then
        echo "Stopping existing server (PID: $SERVER_PID)..."
        kill -9 $SERVER_PID
    fi
fi

# Start the server in the background
echo "Starting server..."
$PYTHON_CMD server.py &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to initialize..."
sleep 2

# Check if server is running
if ! ps -p $SERVER_PID > /dev/null; then
    echo "Error: Server failed to start."
    exit 1
fi

echo "Server started successfully with PID: $SERVER_PID"

# Open browser
echo "Opening browser..."
if command_exists open; then
    open "http://localhost:6969"
elif command_exists xdg-open; then
    xdg-open "http://localhost:6969"
elif command_exists start; then
    start "http://localhost:6969"
else
    echo "Could not automatically open browser."
    echo "Please open http://localhost:6969 in your browser manually."
fi

echo
echo "Server running at http://localhost:6969"
echo "Press Ctrl+C to stop the server"

# Wait for user to press Ctrl+C
trap "echo 'Stopping server...'; kill $SERVER_PID; echo 'Server stopped.'; exit" INT
wait $SERVER_PID 