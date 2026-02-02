#!/usr/bin/env python3
import http.server
import socketserver
import os

# Change to website directory
os.chdir('/home/unknwn/startup-projects/paysure/paysure-website')

PORT = 8080

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"PaySure website serving at http://localhost:{PORT}")
    print("Press Ctrl+C to stop the server")
    httpd.serve_forever()
