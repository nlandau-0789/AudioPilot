from cx_Freeze import setup, Executable
import sys

base = None
if sys.platform == "win32":
    base = "Win32GUI"

with open("config.json", "w") as f:
    f.write('''{"music_dir_path": "", "theme": "#009879", "weighted_shuffle": true}''')

with open("cache/music_list.cache", "w") as f:
    f.write('{}')

setup(
    name="AudioPilot",
    version="1.0",
    description="AudioPilot",
    # executables=[Executable(script="main.py", icon = 'favicon.ico')], 
    executables=[Executable(script="main.py", base = base, icon = 'favicon.ico')],
    options={
        "build_exe": {
            # "packages": ["eyed3", "multiprocessing"],
            "include_files": ["frontend", "cache", "config.json", "favicon.ico", "favicon.png"]
        }
    }
)