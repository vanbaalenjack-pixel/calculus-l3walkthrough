#!/usr/bin/env python3
"""Serve the exact public artifact locally, with capacity for browser test workers."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from functools import partial
import argparse

class PreviewServer(ThreadingHTTPServer):
    request_queue_size = 128

class Handler(SimpleHTTPRequestHandler):
    def list_directory(self, path):
        self.send_error(404)
        return None
    def log_message(self, format, *args):
        if args and str(args[1]) not in ('200', '304'):
            super().log_message(format, *args)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8004)
    args = parser.parse_args()
    directory = Path(__file__).resolve().parents[1] / '_site'
    PreviewServer(('127.0.0.1', args.port), partial(Handler, directory=str(directory))).serve_forever()
