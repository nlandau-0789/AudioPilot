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

## Installer cx_Freeze
```shell
pip install cx_Freeze
```

## Lancer le build de l'application
```shell
python setup.py build
```

L'application se trouvera dans /build/quelque chose/main.exe

## Configuration

Après avoir lancé l'application, assurez-vous de configurer les paramètres en suivant ces étapes :

1. Accédez aux paramètres de l'application.
2. Ecrivez le chemin du dossier approprié pour que l'application puisse accéder à vos fichiers audio.
