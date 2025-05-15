# Utilisation de l'image officielle de Node.js
FROM node:18

# Définition du répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copier tout le contenu du backend dans le conteneur
COPY . .

# Exposer le port sur lequel le backend va tourner
EXPOSE 5000

# Définition de la variable d'environnement pour éviter les logs inutiles
ENV NODE_ENV=production

# Commande pour lancer le serveur
CMD ["node", "server.js"]
