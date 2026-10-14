FROM node:20-bookworm-slim
WORKDIR /app
COPY backend/package.json ./package.json
RUN npm install --omit=dev --ignore-scripts --no-audit --no-fund
COPY backend/src ./src
COPY admin-ua-v5.html ./admin-ui/admin-ua-v5.html
ENV NODE_ENV=production
ENV IIG_ADMIN_UI_DIR=/app/admin-ui
EXPOSE 8787
CMD ["node","src/server.mjs"]
