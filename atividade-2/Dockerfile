FROM node:12.14.1-alpine3.11 AS build

COPY . .
RUN npm ci
RUN npm run test
RUN npm run build && NODE_ENV=production npm prune

FROM node:12.14.1-alpine3.11
COPY --from=build build .
COPY --from=build node_modules ./node_modules

ENTRYPOINT [ "node" ]
CMD [ "index.js" ]
