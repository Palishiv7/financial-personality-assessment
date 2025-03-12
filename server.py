#!/usr/bin/env python3
"""
Ultra-minimal HTTP Server for Financial Debiasing Advisor
"""

import http.server
import socketserver

# Define port (6969 for uniqueness)
PORT = 6969

# Simplified CORS handler with minimal code
class CORSHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

# Just run the server directly
if __name__ == "__main__":
    print(f"Server running at http://localhost:{PORT}")
    print("Press Ctrl+C to stop")
    
    try:
        with socketserver.TCPServer(("", PORT), CORSHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    except Exception as e:
        print(f"Error: {e}") 