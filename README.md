<img src="https://github.com/oliviahealth/ichild/assets/48499839/793bf4eb-18ee-4028-8d57-422aff598fd3" width="500px" height="150px"/>

IntelligentCHILD (Community Health Information Local Database) is an semantic search engine indexing curated resources and content in an intuitive format for mothers, children and families.

- Query a curated datbase of resources/content with natural language prompts
- Create user accounts to revisit past queries and saved resources/content
- Includes CRUD portal for admins to manage content
- Connects to the Ollie API to create responses

## Screenshots  
<img src="https://github.com/oliviahealth/ichild/assets/48499839/e1b713bd-a3ae-4680-afb8-bdbaf8d80137" />

<img src="https://github.com/oliviahealth/ichild/assets/48499839/9176c69d-7c5d-43fb-a01c-ddf966c33332" />

<img src="https://github.com/oliviahealth/ichild/assets/48499839/f9bbdceb-8149-4206-bf0d-5af76b299e4c" />

## iChild Local Deployment Guide
This guide covers the necessary dependencies and steps to run the iChild application locally.

The application runs using two Docker containers:
- Frontend: React application
- Backend: Flask application

### Prerequisites

Ensure you have the following installed:

- Docker
- Git

### 1. Clone the Repository
``` bash
git clone https://github.com/oliviahealth/ichild.git
cd ichild
```

### 2. Create Environment Variables
In the root of the repository, create a file named `.env`:
``` bash
touch .env
```

Add the following contents:
``` bash
VITE_API_URL='http://localhost:5000'
VITE_GOOGLE_API_KEY='AIzaSyBQmndv6caGHFZzm2SaupLvT4Faxj2FK2s'

OLLIE_API_URL='http://intelligentchild.org/ollie' # or ollie api running on docker
POSTGRESQL_CONNECTION_STRING='postgresql+psycopg2://ichild:ichild@db:5432/ichild'
ADMIN_POSTGRESQL_CONNECTION_STRING='postgresql+psycopg2://ichild:ichild@db:5432/ichild'
POSTGRES_DSN='postgresql://ichild:ichild@db:5432/ichild'

GOOGLE_API_KEY='' # see the sharepoint documentation
OPENAI_API_KEY='' # see the sharepoint documentation
SECRET_KEY="8E72CB3EA1DE366872FB5E238A381"

```

### 3. Build and Run Containers
From the root directory:
```
docker compose up
```
Docker will:
- Pull required images
- Build frontend and backend
- Start PostgreSQL
- Install dependencies

You should see logs indicating:
- Frontend build completion
- Backend startup
- PostgreSQL initialization
