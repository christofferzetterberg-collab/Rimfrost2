# A small web server for playing Rimfrost 2 on your own computer.
# It tells the browser never to keep old copies of the game files, so you always get the newest version when you reload.
# Run it in Terminal from the Rimfrost2 folder:  python3 serve.py   – then open http://localhost:8000
import http.server, socketserver

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", 8000), NoCache) as httpd:
    print("Rimfrost 2 is running at http://localhost:8000  (press Ctrl+C to stop)")
    httpd.serve_forever()
