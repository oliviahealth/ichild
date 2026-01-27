<img src="https://github.com/oliviahealth/ichild/assets/48499839/793bf4eb-18ee-4028-8d57-422aff598fd3" width="500px" height="150px"/>

IntelligentCHILD (Community Health Information Local Database) is an semantic search engine indexing curated resources and content in an intuitive format for mothers, children and families.

- Query a curated datbase of resources/content with natural language prompts
- Create user accounts to revisit past queries and saved resources/content
- Includes CRUD portal for admins to manage content

## Screenshots  
<img src="https://github.com/oliviahealth/ichild/assets/48499839/e1b713bd-a3ae-4680-afb8-bdbaf8d80137" />

<img src="https://github.com/oliviahealth/ichild/assets/48499839/9176c69d-7c5d-43fb-a01c-ddf966c33332" />

<img src="https://github.com/oliviahealth/ichild/assets/48499839/f9bbdceb-8149-4206-bf0d-5af76b299e4c" />

## Tech Stack  

**Client:** TypeScript, React, React Query, Zod, Zustand, TailwindCSS

**Server:** Python, Flask, Flask-JWT, PostgreSQL, SQLAlchemy, PyTorch, Sentence-Transformers

## Environment Variables
Contact @sumitnalavade for details

**Frontend:** `VITE_API_URL` `VITE_GOOGLE_API_KEY`  
**Backend:** `POSTGRESQL_CONNECTION_STRING` `ADMIN_POSTGRESQL_CONNECTION_STRING` `GOOGLE_API_KEY` `MODEL_PATH` `SECRET_KEY`

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
VITE_GOOGLE_API_KEY='YOUR_GOOGLE_API_KEY'

POSTGRESQL_CONNECTION_STRING='postgresql+psycopg2://ichild:ichild@db:5432/ichild'
ADMIN_POSTGRESQL_CONNECTION_STRING='postgresql+psycopg2://ichild:ichild@db:5432/ichild'
POSTGRES_DSN='postgresql://ichild:ichild@db:5432/ichild'

GOOGLE_API_KEY='YOUR_GOOGLE_API_KEY'
OPENAI_API_KEY='YOUR_OPENAI_API_KEY'

MODEL_PATH='/app/models/model1'
SECRET_KEY='YOUR_SECRET_KEY'

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
- Location data seeded from location_rows.csv
