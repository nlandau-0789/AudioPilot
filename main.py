from backend.server import server
import sys
import webview

def main():
    server_instance = server()
    server_instance.start()
    webview.create_window(
        "AudioPilot",
        "http://127.0.0.1:6548",
        maximized=True,
    )
    webview.start()
    server_instance.stop()
    sys.exit()

import multiprocessing

if __name__ == '__main__':
    # multiprocessing.set_start_method('fork')
    multiprocessing.freeze_support()
    main()

