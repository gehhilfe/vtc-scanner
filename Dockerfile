FROM node:8-alpine
WORKDIR /usr/src/app
COPY . ./

RUN npm install
WORKDIR webapp
RUN npm install
RUN npm rebuild node-sass
RUN ./node_modules/.bin/ng build
WORKDIR ..

EXPOSE 8080
ENV NODE_ENV=production
CMD [ "npm", "start" ]
