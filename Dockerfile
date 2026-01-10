FROM node:14.15
WORKDIR /usr/src/app
COPY package*.json ./
COPY .env ./.env
RUN npm install -g nodemon
RUN npm install 
COPY . .
EXPOSE 9003
CMD [ "npm","start"]
