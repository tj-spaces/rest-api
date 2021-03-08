docker build . -t nebula-rest-api
docker tag nebula-rest-api:latest 763687816313.dkr.ecr.us-east-1.amazonaws.com/nebula-rest-api:latest
docker push 763687816313.dkr.ecr.us-east-1.amazonaws.com/nebula-rest-api:latest
