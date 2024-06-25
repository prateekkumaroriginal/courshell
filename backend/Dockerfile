FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY db ./db

COPY . .

RUN npx prisma generate
RUN node ./db/seed.js

EXPOSE 3000

CMD ["node", "index.js"]
