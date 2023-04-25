# node-gpt

[Auto-GPT](https://github.com/Significant-Gravitas/Auto-GPT) but node.js

## Status

Just a toy. Run at own risk!

## Capabilities:

- Receives a command and persues it autonomously
- Creates files and runs commands within a docker container
- Searches the internet via [SerpAPI](https://serpapi.com/)
- Requests user feedback if stuck
- Delegates sub-tasks to child agents
- Long term memory using either [hnswlib](https://github.com/nmslib/hnswlib) or with [Pinecone](https://www.pinecone.io/)

## Quickstart

1. Clone the repo
2. `cd` into the dir
3. `npm install`
4. `cp .env_example .env` and fill out the missing values
5. `npm run start`

## Requirements

- Docker
- node.js
