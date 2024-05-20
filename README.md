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

## Run Locally
**Clone the project**
~~~bash  
  git clone https://github.com/oliviahealth/ichild.git
~~~

**Go to the project directory**
~~~bash  
  cd ichild
~~~

**Install frontend dependencies**
~~~bash
cd frontend
~~~

~~~bash  
npm install
~~~

**Add frontend environment variables**
~~~bash  
touch .env
~~~

~~~bash  
`VITE_API_URL`

`VITE_GOOGLE_API_KEY`
~~~

**Start client**
~~~bash  
npm run dev
~~~

**Install backend dependencies**
~~~bash  
cd backend
~~~

~~~bash
cd server
~~~

~~~bash  
pip install -r requirements.txt
~~~

**Add backend environment variables**
~~~bash  
touch .env
~~~

~~~bash  
`POSTGRESQL_CONNECTION_STRING`

`ADMIN_POSTGRESQL_CONNECTION_STRING`

`GOOGLE_API_KEY`

`MODEL_PATH`

`SECRET_KEY`
~~~

**Start server**
~~~bash  
cd search
~~~

~~~bash  
flask run
~~~
