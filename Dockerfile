FROM node:20

WORKDIR /app

# Install dependencies first
COPY package*.json ./

RUN npm install

# Copy prisma FIRST (important fix)
COPY prisma ./prisma

# Copy rest of project
COPY . .

# Generate Prisma client AFTER schema exists
RUN npx prisma generate

# Build Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]