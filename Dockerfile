FROM node:20-alpine

WORKDIR /app

# Copy dependency files first
COPY package*.json ./

RUN npm install

# Copy prisma BEFORE generate
COPY prisma ./prisma

# Copy everything else
COPY . .

# NOW generate prisma manually (safe point)
RUN npx prisma generate

# Build Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]