# Dockerfile for Vite/React frontend
FROM node:18

WORKDIR /app

# COPY package.json package-lock.json ./
# RUN npm install --legacy-peer-deps  && npm install @rollup/rollup-linux-x64-gnu --save-optional

# COPY . .

# EXPOSE 5173

# CMD ["npm", "run", "dev", "--", "--port", "5173", "--open", "--host"]


# Copy package files
# COPY package.json pnpm-lock.yaml ./

# Cài pnpm
RUN npm install -g pnpm

# Cài dependencies bằng pnpm
# RUN pnpm install

# Copy toàn bộ mã nguồn
COPY . .

EXPOSE 5175

CMD ["pnpm", "run", "dev", "--", "--port", "5175", "--host", "0.0.0.0"]