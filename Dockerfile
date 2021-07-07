FROM alpine

COPY Api  /code/Api
COPY resources /code/resources
COPY package.json /code

#env PORT has to be added, The value of PORT has to be exposed.
#Creation:
# docker create -e "PORT=[port]" -p [port]:[port] --name [name] memeit-frontend:0.1
#Run:
# docker run -e "PORT=[port])" -p [port]:[port] --name [name] memeit-frontend:0.1

RUN apk add --update npm
RUN cd code/ && npm install

CMD cd code/ && npm start