FROM node:16.19

WORKDIR  /app 

COPY . . 

EXPOSE 5000 

CMD ["npm" , "start" ]

