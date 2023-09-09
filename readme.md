# Installation

Pour utiliser ce projet, suivez ces étapes d'installation :

## Créer un environnement Python virtuel (recommandé, mais non obligatoire) :

```shell
python -m venv venv
```

```shell
.\venv\Scripts\activate
```

## Installer les modules nécessaires :

```shell
pip install -r requirements.txt
```


## build Pyinstaller

```shell
pyinstaller.exe --add-data "frontend;frontend" --add-data "cache;cache" --add-data "config.json;." --clean --noconsole --icon "favicon.ico" main.py
```

## build cx_freeze
```shell
python setup.py build
```

## Configuration

Après avoir lancé l'application, assurez-vous de configurer les paramètres en suivant ces étapes :

1. Accédez aux paramètres de l'application.
2. Ecrivez le chemin du dossier approprié pour que l'application puisse accéder à vos fichiers audio.
