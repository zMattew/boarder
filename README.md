# Boarder
Boarder is an user-friendly web interface for visualize your data in various format. You can connect to your sources and generate a dynamic ui using the power of your own local LLM or usign API.

## Key features
- 📚Component builder: connect to your sources and use Ai to define what data to get and in what format in a single prompt.
- 📱Dynamic UI: zoom, pan your views and drag,drop and resize your components as you want.
- 🧩Bring your own LLM: self host or use api to connect to your favourite LLM to start generating your view.
- 💿Indipendent data: connect your database hosted everywhere and retrieve your own data. 
- 🤝Team based: create your team and collaborate with your mates.
- ⚙️Customizable: open source, clone and modify as you want.

## Setup
Before proceed you need to install [Docker](https://www.docker.com/), [git](https://git-scm.com/downloads) and [OpenSSL](https://openssl-library.org/source/):
1. Clone this repository
   ```bash
   git clone https://github.com/zMattew/ai-board.git
   ```
2. Populate the docker-compose file with temeplated env.
   You need to configure the smtp env for magic link login or use a third party auth provider adding the env named according to [next-auth notation](https://authjs.dev/getting-started/authentication/oauth).
   the providers function are automatically passed to auth handler.
   ```dockercompose
   AUTH_{PROVIDER}_ID
   AUTH_{PROVIDER}_SECRET
   ```
   Use this command for (ui,api)PV_KEY, (ui,api)AUTH_SECRET, (rest-redis)SRH_TOKEN
   ```bash
   openssl rand -hex 32
   ```
   It advised to change the default password in the various service if they are gonna be exposed to internet.
4. Generate a self signed certificate for SSL:
   ```bash
   bash ./nginx/generateSSL.sh 
   ```
5. Run
   ```bash
   docker compose up
   ```
6. Connect to web interface navigating to default [url](https://localhost/home)
  
## Local development
This is a turbo mono repo, if you want to modify make changes you need to install [node](https://nodejs.org/en/download) before proceed:
1. Install dependecy:
   ```bash
   npm install
   ```
2. Populate .env.local file with the required env in the ui and api workspace
3. Deploy a local postgres database and push the schema.
   ```bash
   npx prisma migrate deploy
   ```
4. Run dev
   ```bash
   turbo run dev
   ```
## Beta
Current version is in beta and need some work to extends features, improve performance and fix (unknow) bug.

## Next Features 
- More databases support (current postgres, mysql)
- Option to https sources
- Infinite scroll query
- Exposed api
- View embeeding
- Exposed api

## Known issue
- The api is not implemented but required to sync the db schema. In the future should have the functionality exposed.
- The ui has a cache handler but there is no fine-graded caching implemented.