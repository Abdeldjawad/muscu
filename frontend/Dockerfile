
FROM node:18 AS build


WORKDIR /app


COPY package*.json ./
RUN npm install


COPY . .


RUN npm run build --prod


FROM nginx:alpine


COPY --from=build /app/dist /usr/share/nginx/html

# mettre le port 80
EXPOSE 80

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]
