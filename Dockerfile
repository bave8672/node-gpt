FROM node

WORKDIR /app
COPY dist/ .
COPY package*.json .
COPY .env .

RUN npm ci --omit=dev
RUN ls ./

CMD ["node", "main.js"]
