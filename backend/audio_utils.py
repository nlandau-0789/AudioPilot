def format_time(seconds):
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = int(seconds % 60)
    
    if hours > 0:
        return f'{hours}:{minutes:02}:{seconds:02}'
    else:
        return f'{minutes}:{seconds:02}'

import eyed3
def get_audio_data(filename):
    audio = eyed3.load(filename)
    # print(audio)
    try :
        result = {
            "Titre": [audio.tag.title]*2,
            "Artiste": [audio.tag.artist]*2,
            "Durée": [format_time(audio.info.time_secs), audio.info.time_secs],
            "Album": [audio.tag.album or ""]*2,
            "Score": [audio.tag.payment_url or "0"]*2,
            "filename": [filename]*2,
        }
    except AttributeError:
        audio.initTag()
        result = {
            "Titre": [filename.replace("../music/", "")]*2,
            "Artiste": [""]*2,
            "Durée": [format_time(audio.info.time_secs), audio.info.time_secs],
            "Album": [""]*2,
            "Score": ["0"]*2,
            "filename": [filename]*2,
        }
    audio.tag.title = filename.replace("../music/", "")
    audio.tag.artist = ""
    audio.tag.payment_url = audio.tag.payment_url or "0"
    audio.tag.save()
    return result

def update_score(filename, new_score):
    import os
    audio = eyed3.load(os.path.join("/music", filename))
    audio.tag.payment_url = new_score
    audio.tag.save()