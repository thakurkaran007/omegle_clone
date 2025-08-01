FROM node:21

WORKDIR /usr/app/src

COPY package.json .

RUN npm install

COPY . .

RUN npm run db:generate
RUN npm run build

CMD ["npm","run", "dev"]