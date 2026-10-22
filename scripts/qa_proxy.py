# -*- coding: utf-8 -*-
"""QA 同源代理:/qa-harness.html 本地直出(不经 Vite,避免被 gate),
其余路径转发到 Vite(5199)。仅本地 QA 用。"""
import http.server
import urllib.request
import socketserver
import os

VITE = "http://localhost:5173"
HARNESS = os.path.join(os.path.dirname(__file__), "..", "qa-harness.html")

class Proxy(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.split("?")[0] in ("/qa", "/qa/", "/qa-harness.html"):
            with open(HARNESS, "rb") as f:
                body = f.read()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        url = VITE + self.path
        try:
            req = urllib.request.Request(url, headers={"Accept": self.headers.get("Accept", "*/*")})
            with urllib.request.urlopen(req, timeout=10) as r:
                body = r.read()
                ctype = r.headers.get("Content-Type", "application/octet-stream")
                self.send_response(r.status)
                self.send_header("Content-Type", ctype)
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
        except Exception as e:
            self.send_response(502)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(f"proxy error: {e}".encode("utf-8"))

    def log_message(self, *a):
        pass

    def log_message(self, *a):
        pass

class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

if __name__ == "__main__":
    print("proxy on 8124 -> 5199")
    Server(("127.0.0.1", 8124), Proxy).serve_forever()
