FROM node:8.16-alpine

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/

# Since we use babel so npm prod and dev production
RUN npm i

COPY . /usr/src/app/

CMD [ "node", "./index.js"]