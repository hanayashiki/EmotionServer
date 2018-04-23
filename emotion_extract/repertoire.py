def loadRepertoire():
    emotions = {
        "amusement": [],
        "anger": [],
        "excitement": [],
        "sadness": []
    }
    for emotion in emotions.keys():
        file = open("./emotion_extract/static/musics/" + emotion + "_music.txt")
        lines = file.read().strip().split('\n')
        emotions[emotion] = list(zip([lines[name_idx] for name_idx in range(0, len(lines), 2)],
                                [lines[link_idx] for link_idx in range(1, len(lines), 2)]))
    return emotions

repertoire = loadRepertoire()