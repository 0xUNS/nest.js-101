FROM node:20
WORKDIR /app
COPY prisma ./prisma
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
RUN npx prisma generate
EXPOSE 3000
CMD ["yarn", "start:prod"]
