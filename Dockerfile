FROM node:22-slim

# Install Chromium + xvfb dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    xvfb \
    xauth \
    fonts-liberation \
    --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Tell puppeteer to use system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV CHROME_PATH=/usr/bin/chromium

WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts

COPY . .
RUN npm run build

# Create data directory
RUN mkdir -p /app/data

ENV NITRO_PORT=3005
ENV NITRO_HOST=0.0.0.0
EXPOSE 3005

# Run with xvfb for Chrome with virtual display (shell form required for xvfb-run)
CMD xvfb-run -a -s "-ac -screen 0 1920x1080x24" node .output/server/index.mjs
