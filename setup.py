from cx_Freeze import setup, Executable
import sys

base = None
if sys.platform == "win32":
    base = "Win32GUI"

setup(
    name="AudioPilot",
    version="1.0",
    description="A noice audio player",
    # executables=[Executable(script="main.py", icon = 'favicon.ico')], 
    executables=[Executable(script="main.py", base = base, icon = 'favicon.ico')],
    options={
        "build_exe": {
            "packages": ["eyed3", "multiprocessing"],
            "include_files": ["frontend", "cache", "config.json", "favicon.ico", "favicon.png"]
        }
    }
)