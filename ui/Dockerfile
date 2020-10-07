FROM node:12-alpine as build

COPY . /src
WORKDIR /src

RUN npm ci
RUN npm run build
RUN npm prune --production

FROM node:12-alpine

WORKDIR /usr/app

COPY --from=build /src/node_modules /usr/app/node_modules
COPY --from=build /src/package.json /usr/app/package.json
COPY --from=build /src/.next /usr/app/.next

ENV NODE_ENV production
ENV PORT 3000
ENV DEPLOY_URL "dreams.wtf"

EXPOSE 3000

CMD ["npm", "start"]