# 📘 xcraft-server

## Aperçu

`xcraft-server` est un module de démarrage autonome (_standalone_) pour le framework Xcraft. Il orchestre l'initialisation de l'environnement de configuration, la création des répertoires nécessaires, la génération des fichiers de configuration via [`xcraft-core-etc`][xcraft-core-etc], puis lance le serveur Xcraft principal via [`xcraft-core-server`][xcraft-core-server]. Il constitue le point d'entrée principal pour déployer une application Xcraft en mode serveur indépendant.

## Sommaire

- [Structure du module](#structure-du-module)
- [Fonctionnement global](#fonctionnement-global)
- [Exemples d'utilisation](#exemples-dutilisation)
- [Interactions avec d'autres modules](#interactions-avec-dautres-modules)
- [Variables d'environnement](#variables-denvironnement)
- [Détails des sources](#détails-des-sources)
- [Licence](#licence)

## Structure du module

Le module est composé de deux fichiers principaux situés dans `lib/` :

- **`server.js`** — Point d'entrée public du module (défini dans `main`). Initialise optionnellement l'environnement, exécute un callback post-initialisation, puis démarre le serveur Xcraft.
- **`init-env.js`** — Responsable de la préparation complète de l'environnement : création des répertoires, génération des configurations initiales et positionnement des variables d'environnement.

## Fonctionnement global

Le démarrage du serveur suit une séquence précise :

```
server.js
  │
  ├── [si !skipEnv] → init-env.js
  │     ├── Positionne les variables d'environnement (XCRAFT_ROOT, XCRAFT_ATTACH, XCRAFT_LOGS)
  │     └── initEtc()
  │           ├── Crée l'arborescence de répertoires (etc/, var/, var/run/)
  │           ├── Écrit le fichier de configuration xcraft principal (etc/xcraft/config.json)
  │           ├── [si !initialized] → Etc.createAll() pour xcraft-core-*, xcraft-contrib-*, goblin-*
  │           └── Marque l'initialisation dans var/.xcraft-server-initialized
  │
  ├── [si afterInit] → callback afterInit()
  │
  └── xcraft-core-server.runAsLib()
```

### Mécanisme d'initialisation conditionnelle

L'initialisation complète des configurations (`Etc.createAll`) n'est exécutée qu'une seule fois. Un fichier sentinelle `var/.xcraft-server-initialized` est utilisé pour vérifier si l'initialisation a déjà eu lieu. Ce fichier stocke la date de dernière modification (`mtime`) du fichier `etc/xcraft/config.json` ; si cette date correspond encore à la version actuelle du fichier de configuration, l'initialisation complète est ignorée lors des redémarrages.

Si un fichier `config.js` est présent à la racine du projet, il est automatiquement détecté et utilisé comme _overrider_ pour personnaliser la configuration générée par [`xcraft-core-etc`][xcraft-core-etc]. Un second overrider additionnel peut également être fourni via le paramètre `overrider`.

## Exemples d'utilisation

### Démarrage basique d'un serveur Xcraft

```javascript
const xcraft = require('xcraft-server');

xcraft(
  '/var/myapp/config', // configPath : répertoire racine de configuration
  '/opt/myapp' // projectPath : répertoire du projet (contenant node_modules)
);
```

### Démarrage avec callback post-initialisation

```javascript
const xcraft = require('xcraft-server');

xcraft('/var/myapp/config', '/opt/myapp', () => {
  console.log('Environnement initialisé, serveur en cours de démarrage...');
});
```

### Démarrage en ignorant l'initialisation de l'environnement

Utile lorsque l'environnement est déjà configuré manuellement (variables d'environnement positionnées en amont) :

```javascript
const xcraft = require('xcraft-server');

xcraft(
  '/var/myapp/config',
  '/opt/myapp',
  null,
  true // skipEnv = true
);
```

### Utilisation de `initEtc` seul

Permet d'initialiser uniquement la structure de configuration sans démarrer le serveur, utile pour des scripts de préparation ou de migration :

```javascript
const {initEtc} = require('xcraft-server/lib/init-env.js');

initEtc(
  '/var/myapp/config', // configPath
  '/opt/myapp', // projectPath
  'my-app-id', // appId (optionnel, par défaut xcraft-core-host.appId)
  '/opt/myapp/overrides/custom.js' // overrider supplémentaire (optionnel)
);
```

## Interactions avec d'autres modules

- **[xcraft-core-server]** : Lance le serveur Xcraft principal via `runAsLib()`
- **[xcraft-core-etc]** : Génère les fichiers de configuration pour tous les modules détectés dans `node_modules` (filtres `xcraft-core-*`, `xcraft-contrib-*`, `goblin-*`)
- **[xcraft-core-host]** : Fournit l'identifiant d'application (`appId`) par défaut lorsqu'il n'est pas explicitement spécifié
- **[xcraft-core-log]** : Système de journalisation utilisé en interne par `xcraft-core-server`
- **`fs-extra`** : Manipulation du système de fichiers (création de répertoires, lecture/écriture JSON)

## Variables d'environnement

| Variable        | Description                                                        | Exemple             | Valeur par défaut |
| --------------- | ------------------------------------------------------------------ | ------------------- | ----------------- |
| `XCRAFT_ROOT`   | Chemin racine de la configuration Xcraft (défini sur `configPath`) | `/var/myapp/config` | _(obligatoire)_   |
| `XCRAFT_ATTACH` | Désactivé lors de l'initialisation autonome (mode standalone)      | `0`                 | `0`               |
| `XCRAFT_LOGS`   | Active la journalisation console                                   | `1`                 | `1`               |
| `PATH`          | Utilisé pour peupler le champ `path` dans `etc/xcraft/config.json` | _(système)_         | _(système)_       |

## Détails des sources

### `lib/server.js`

Point d'entrée public du module (`main` dans `package.json`). Exporte une fonction unique qui orchestre le démarrage complet du serveur. Lance une erreur explicite si `configPath` ou `projectPath` ne sont pas fournis.

#### Méthodes publiques

- **`module.exports(configPath, projectPath, afterInit=null, skipEnv=false)`** — Initialise l'environnement (sauf si `skipEnv` est `true`), exécute le callback optionnel `afterInit`, puis démarre le serveur via `xcraft-core-server.runAsLib()`. Lève une erreur si `configPath` ou `projectPath` ne sont pas fournis.

### `lib/init-env.js`

Gère l'ensemble de la phase d'initialisation de l'environnement. Exporte la fonction principale d'initialisation ainsi que `initEtc` séparément pour une utilisation modulaire indépendante du démarrage du serveur.

#### Méthodes publiques

- **`module.exports(configPath, projectPath, appId=null, overrider=null)`** — Positionne les variables d'environnement (`XCRAFT_ROOT=configPath`, `XCRAFT_ATTACH=0`, `XCRAFT_LOGS=1`) puis délègue à `initEtc`.

- **`module.exports.initEtc(configPath, projectPath, appId=null, overrider=null)`** — Crée l'arborescence de répertoires nécessaires (`etc/`, `etc/xcraft/`, `var/`, `var/run/`), génère le fichier de configuration Xcraft principal (`etc/xcraft/config.json` avec `xcraftRoot`, `pkgTargetRoot` et `path`), et déclenche la création de toutes les configurations de modules via [`xcraft-core-etc`][xcraft-core-etc] si l'initialisation n'a pas encore été effectuée. Détecte automatiquement un fichier `config.js` à la racine de `projectPath` et accepte un `overrider` additionnel.

## Licence

Ce module est distribué sous [licence MIT](./LICENSE).

---

[xcraft-core-server]: https://github.com/Xcraft-Inc/xcraft-core-server
[xcraft-core-etc]: https://github.com/Xcraft-Inc/xcraft-core-etc
[xcraft-core-host]: https://github.com/Xcraft-Inc/xcraft-core-host
[xcraft-core-log]: https://github.com/Xcraft-Inc/xcraft-core-log

_Ce contenu a été généré par IA_
