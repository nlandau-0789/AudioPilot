from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from backend.debug import print
import sys

class RequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):

        message = format % args
        print("%s - - [%s] %s\n" %
                (self.address_string(),
                self.log_date_time_string(),
                message.translate(self._control_char_table)))
    
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        BaseHTTPRequestHandler.end_headers(self)
    
    def do_GET(self):
        from backend.api import get
        handlers = get().handlers
        for handler_data in handlers:
            if handler_data["path"] == self.path:
                self.send_response(200)
                self.send_header('Content-type', handler_data["content_type"])
                self.end_headers()
                response_data = handler_data["handler"]() or b""
                self.wfile.write(response_data)
                return
        if self.headers.get('Range'):
            import os, urllib.parse
            if sys.platform == "win32":
                self.path = urllib.parse.unquote(self.path).strip("/")
            else :
                self.path = urllib.parse.unquote(self.path)
            self.file_size = os.path.getsize(self.path)
            range_header = self.headers.get('Range')
            start_byte = int(range_header.split('=')[1].split('-')[0])
            end_byte = min(start_byte + 2**20, self.file_size)  # Adjust chunk size as needed
            self.send_response(206)
            self.send_header('Content-Range', f'bytes {start_byte}-{end_byte-1}/{self.file_size}')
            self.send_header('Content-Length', end_byte - start_byte)
            self.send_header('Content-Type', 'audio/mp3')  # Adjust content type based on your audio format
            self.end_headers()
            with open(self.path, 'rb') as file:
                file.seek(start_byte)
                chunk = file.read(end_byte - start_byte)
                self.wfile.write(chunk)
            return
        self.path = self.path.strip("/")
        try:
            with open(self.path, 'rb') as file:
                self.send_response(200)
                if self.path.endswith('.html'):
                    self.send_header('Content-type', 'text/html')
                elif self.path.endswith('.css'):
                    self.send_header('Content-type', 'text/css')
                elif self.path.endswith('.js'):
                    self.send_header('Content-type', 'application/javascript')
                self.end_headers()
                self.wfile.write(file.read())
        except FileNotFoundError:
            self.send_response(200)
            self.send_header('Content-type', 'text/json')
            self.end_headers()
            self.wfile.write(json.dumps(f"404 - Not Found : {self.path}").encode("utf-8"))
    
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        try:
            data = json.loads(post_data.decode('utf-8'))
        except json.JSONDecodeError:
            self.send_response(400)  # Bad Request
            self.end_headers()
            self.wfile.write(b'Invalid JSON data')
            return

        from backend.api import post
        handlers = post().handlers
        for handler_data in handlers:
            if handler_data["path"] == self.path:
                self.send_response(200)
                self.send_header('Content-type', handler_data["content_type"])
                self.end_headers()
                response_data = handler_data["handler"](data)
                self.wfile.write(response_data or b"")
                return

        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"")

from multiprocessing import Process
class server:
    def __init__(self) -> None:
        self.running = False
        self.PORT = 6549

    def server_runner(self):
        server_address = ('', self.PORT)
        with HTTPServer(server_address, RequestHandler) as httpd:
            print(f"Serving at port {self.PORT}\n")
            httpd.serve_forever()

    def start(self):
        self.server_process = Process(target=self.server_runner)
        self.server_process.start()

        
    def stop(self):
        self.server_process.terminate()
        self.server_process.join()
        self.server_process = None