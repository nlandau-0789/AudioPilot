from backend.server import server
import sys
from PyQt6.QtWidgets import QApplication, QMainWindow
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtCore import Qt, QUrl
from PyQt6.QtGui import QIcon

class WebApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.initUI()

    def initUI(self):
        # Create a web view
        self.web_view = QWebEngineView()
        # self.web_view.page().profile().setHttpUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36")
        self.web_view.setUrl(QUrl("http://localhost:6548/"))  # Replace with your web app URL
        self.setCentralWidget(self.web_view)
        
        # Set window properties
        self.setWindowFlags(Qt.WindowType.Window)
        self.setWindowState(Qt.WindowState.WindowMaximized)

def main():
    server_instance = server()
    server_instance.start()
    # app = QApplication(sys.argv)
    # app.setWindowIcon(QIcon('favicon.ico'))
    # app.setApplicationDisplayName("AudioPilot")
    # ex = WebApp()
    # ex.showMaximized()
    # app.exec()
    # server_instance.stop()
    # sys.exit()

import multiprocessing

if __name__ == '__main__':
    # multiprocessing.set_start_method('fork')
    multiprocessing.freeze_support()
    main()

