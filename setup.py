from cx_Freeze import setup, Executable

setup(
    name="AudioPilot",
    version="1.0",
    description="A noice audio player",
    # executables=[Executable(script="main.py", icon = 'favicon.ico')], #base = "Win32GUI", 
    executables=[Executable(script="main.py", base = "Win32GUI", icon = 'favicon.ico')], #
    options={
        "build_exe": {
            "packages": ["eyed3"],
            "include_files": ["frontend", "cache", "config.json", "favicon.ico", "favicon.png"]
        }
    }
)