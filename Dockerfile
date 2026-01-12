FROM node:18

# Install fonts for PDF generation
RUN apt-get update && \
    apt-get install -y \
    fonts-liberation \
    fonts-noto-cjk \
    fonts-wqy-zenhei \
    fonts-dejavu-core \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY package*.json ./
COPY .env ./.env
RUN npm install -g nodemon
RUN npm install
COPY . .
EXPOSE 9003
CMD [ "npm","start"]
