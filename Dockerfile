FROM node:18.2-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN npm i -g pnpm

COPY package.json /usr/src/app/
COPY pnpm-lock.yaml /usr/src/app/
COPY pnpm-workspace.yaml /usr/src/app/
COPY turbo.json /usr/src/app/
COPY apps/api/package.json /usr/src/app/apps/api/
COPY packages/core/package.json /usr/src/app/packages/core/
COPY packages/database/package.json /usr/src/app/packages/database/
COPY packages/parse-hamlet/package.json /usr/src/app/packages/parse-hamlet/
COPY packages/env/package.json /usr/src/app/packages/env/
COPY packages/types/package.json /usr/src/app/packages/types/


RUN pnpm install

COPY apps/api /usr/src/app/apps/api
COPY packages/core /usr/src/app/packages/core
COPY packages/database /usr/src/app/packages/database
COPY packages/parse-hamlet /usr/src/app/packages/parse-hamlet
COPY packages/env /usr/src/app/packages/env
COPY packages/types /usr/src/app/packages/types

#RUN pnpm install

COPY .env.defaults /usr/src/app/
COPY .env /usr/src/app/

RUN apk add git

RUN pnpm run build
#RUN pnpm run lint
EXPOSE 5000
CMD [ "pnpm", "start-api" ]