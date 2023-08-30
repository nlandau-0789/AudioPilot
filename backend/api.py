import os
import json

class get:
    def __init__(self, path = "", content_type = "application/json", handlers = []):
        self.handlers = handlers
        self.path = path
        self.content_type = content_type
        
    def __call__(self, handler):
        self.handlers.append({"path": self.path, "content_type": self.content_type, "handler": handler})

@get('/', 'text/html')
def get_front():
    with open('frontend/index.html', 'rb') as file:
        return file.read()

@get('/api/music-count')
def get_music_count():
    music_count = len([filename for filename in os.listdir("../music") if ".mp3" in filename])

    response_data = {"count": music_count}
    response_json = json.dumps(response_data).encode('utf-8')

    return response_json

@get('/api/music-list')
def get_music_list():
    music_list = [filename for filename in os.listdir("../music") if ".mp3" in filename]

    response_data = {"list": music_list}
    response_json = json.dumps(response_data).encode('utf-8')

    return response_json

from audio_utils import get_audio_data
def make_full_cache():
    music_list = [filename for filename in os.listdir("../music") if ".mp3" in filename]
    music_data = {filename: get_audio_data(os.path.join("../music", filename)) for filename in music_list}
    with open("cache/music_list.cache", "w", encoding="utf-8") as f:
        f.write(json.dumps(music_data))
    print("Done writing full cache")

@get('/api/music-data')
def get_music_list():
    with open("cache/music_list.cache", "r", encoding="utf-8") as f:
        cache = json.loads(f.read())
    music_list = [filename for filename in os.listdir("../music") if ".mp3" in filename]
    music_data = [cache[filename] if filename in cache else get_audio_data(os.path.join("../music", filename)) for filename in music_list]

    response_data = {"list": music_data}
    response_json = json.dumps(response_data).encode('utf-8')

    import threading
    threading.Thread(target=make_full_cache).start()

    return response_json
            