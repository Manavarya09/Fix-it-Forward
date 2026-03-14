FROM node:18-alpine
WORKDIR /srv/app
COPY package*.json ./
RUN apk add --no-cache python3 make g++ && npm ci --only=production
COPY . .
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node","index.js"]
