FROM node:22-slim

# Install Chromium + xvfb dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    xvfb \
    xauth \
    fonts-liberation \
    --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
# Allow puppeteer to download its own patched Chrome
RUN npm install

COPY . .
RUN npm run build

# Create data directory
RUN mkdir -p /app/data

ENV NITRO_PORT=3005
ENV NITRO_HOST=0.0.0.0
EXPOSE 3005

# Run with xvfb for Chrome with virtual display (shell form required for xvfb-run)
CMD xvfb-run -a -s "-ac -screen 0 1920x1080x24" node .output/server/index.mjs
