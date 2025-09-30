# Dockerfile for Vite/React frontend
FROM node:18

WORKDIR /app

# COPY package.json package-lock.json ./
# RUN npm install --legacy-peer-deps  && npm install @rollup/rollup-linux-x64-gnu --save-optional

# COPY . .

# EXPOSE 5173

# CMD ["npm", "run", "dev", "--", "--port", "5173", "--open", "--host"]

# Cài pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Cài dependencies bằng pnpm
RUN pnpm install

# Copy toàn bộ mã nguồn
COPY . .

EXPOSE 5173

CMD ["pnpm", "dev", "--", "--port", "5173", "--open", "--host"]