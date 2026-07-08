# UpcycleConnect - Projet Annuel ESGI (2ème Année)

Bienvenue sur le dépôt du projet **UpcycleConnect**, un projet annuel réalisé dans le cadre de la 2ème année à l'**ESGI Paris**. 

UpcycleConnect est une plateforme web moderne dédiée à l'upcycling et au recyclage, connectant les utilisateurs avec des points de collecte, des événements locaux et des solutions propulsées par l'Intelligence Artificielle.

---

## 🚀 Architecture & Technologies

Le projet est structuré en deux parties principales (Mono-dépôt) :

### 🖥️ Frontend (`/front`)
*   **Framework** : [React 19](https://react.dev/) + [Vite](https://vite.dev/)
*   **Langage** : [TypeScript](https://www.typescriptlang.org/)
*   **Bibliothèque de composants** : [Mantine UI v9](https://mantine.dev/) (avec `@mantine/core`, `dates`, `charts`, `carousel`, etc.)
*   **Gestion de requêtes** : [TanStack React Query](https://tanstack.com/query) & [Axios](https://axios-http.com/)
*   **Internationalisation** : [i18next](https://www.i18next.com/) (Support multi-langue)
*   **Cartographie** : Google Maps API via `@vis.gl/react-google-maps`

### ⚙️ Backend (`/back`)
*   **Langage** : [Go (Golang)](https://go.dev/)
*   **Routeur** : Standard `http.ServeMux` (Go 1.22+)
*   **Rechargement à chaud (Hot Reload)** : [Air](https://github.com/air-verse/air)
*   **Documentation API** : [Swagger / Swaggo](https://github.com/swaggo/swag) (accessible sur `/swagger/`)
*   **Services tiers intégrés** :
    *   **OneSignal** (Notifications push)
    *   **Stripe** (Abonnements & Paiements)
    *   **Google Maps API** (Géolocalisation & Conteneurs)
    *   **Google Gemini API** (Intégration d'IA pour l'analyse/conseil d'upcycling)

---

## 📦 Déploiement & Conteneurisation

Le projet utilise **Docker** et **Docker Compose** pour orchestrer et exécuter les différents services de façon homogène.

*   `upcycle-back` : API Golang (Dockerfile multi-stage).
*   `upcycle-front` : Application React servie par Nginx.
*   `tunnel` : Cloudflare Tunnel (`cloudflared`) pour exposer localement et sécuriser l'accès externe.

---

## 🛠️ Installation et Lancement

### Prérequis
*   [Docker & Docker Compose](https://www.docker.com/)
*   [Go](https://go.dev/) (pour le développement local hors conteneur)
*   [Node.js (v18+)](https://nodejs.org/) (pour le développement local du frontend)

### Lancement avec Docker
1. Renseignez les variables d'environnement nécessaires dans les fichiers `.env` correspondants dans `/back` et `/front`.
2. Lancez l'ensemble des services avec Docker Compose :
   ```bash
   docker compose up --build
   ```

### Lancement en mode Développement (Local)

#### 1. Démarrer le Backend Go (avec Air pour le live-reload)
```bash
cd back
# Copier le fichier d'exemple et configurer les variables
cp .env.example .env
# Lancer avec Air
air
```
*L'API sera disponible sur `http://localhost:8080` et la documentation Swagger sur `http://localhost:8080/swagger/index.html`.*

#### 2. Démarrer le Frontend React
```bash
cd front
# Installer les dépendances
npm install
# Lancer le serveur de dev Vite
npm run dev
```
*L'application sera accessible sur `http://localhost:5173`.*

---

## 📝 Fonctionnalités clés
*   **Authentification et Comptes** : Gestion des profils utilisateurs, rôles et abonnements.
*   **Géolocalisation des Points de Collecte** : Recherche et affichage des conteneurs de tri/upcycling les plus proches.
*   **Système d'annonces et d'événements** : Publication d'annonces de dons/dépôts et organisation d'événements communautaires.
*   **Analyse IA (Gemini)** : Conseils personnalisés d'upcycling basés sur l'intelligence artificielle.
*   **Notifications Push** : Alertes en temps réel via OneSignal.
*   **Paiements** : Gestion des formules d'abonnement premium avec Stripe.

---

## 👥 Membres de l'équipe (2025-2026)
Ce projet a été réalisé par :
*   **Minh Cat DO**
*   **Arnaud LE SAUSSE**
*   **Ayoub AZMAL**

