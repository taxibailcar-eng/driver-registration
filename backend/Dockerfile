FROM node:20-alpine

# Force Railway rebuild - v4
WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

RUN mkdir -p uploads/documents uploads/vehicles data

EXPOSE 3001

CMD ["node", "src/app.js"]