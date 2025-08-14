docker network create sample
docker run --name ai-db --network=sample -p 5432:5432 --env POSTGRES_USER=postgres --env POSTGRES_PASSWORD=password --env POSTGRES_DB=postgres postgres