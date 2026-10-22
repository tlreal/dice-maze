# -*- coding: utf-8 -*-
"""截图用静态服务:直接服务 dist 产物(与线上一致),
/qa-harness.html 从项目根读取。仅本地使用。"""
import http.server
import socketserver
import os

ROOT = os.path.join(os.path.dirname(__file__), "..")
DIST = os.path.join(ROOT, "dist")
HARNESS = os.path.join(ROOT, "qa-harness.html")

MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
}


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=DIST, **kw)

    def do_GET(self):
        path = self.path.split("?")[0]
        if path in ("/qa", "/qa/", "/qa-harness.html"):
            self._send_file(HARNESS)
            return
        super().do_GET()

    def _send_file(self, fp):
        with open(fp, "rb") as f:
            body = f.read()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *a):
        pass


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == "__main__":
    print("static dist on 8125")
    Server(("127.0.0.1", 8125), Handler).serve_forever()
