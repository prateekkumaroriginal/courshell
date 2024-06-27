FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY db ./db

COPY . .

EXPOSE 3000
EXPOSE 5555

CMD ["npm", "run", "dev:docker"]
