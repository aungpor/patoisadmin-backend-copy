docker login prd4containerregistry.azurecr.io
prd4containerregistry
amQ=uTQCRC3n2hBKSHIgBs82P6fMsSl=
docker build --no-cache -t hrbot:1.0 .
docker tag  hrbot prd4containerregistry.azurecr.io/hrbotv1.0
docker push prd4containerregistry.azurecr.io/hrbotv1.0

_req_key_=G2QouWbNmvDHT2zsLcW97hKuKHaf4XHhvCpM9zW8R6PREBANWgU2LQVl3X6cuE1j

https://891f-171-97-170-253.ngrok.io