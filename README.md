<img src="https://raw.githubusercontent.com/oliviahealth/ichild/main/src/assets/logos/TAMU-ichild_logo.png?token=GHSAT0AAAAAACF66JDC6F6EGJY6EYA77HQ2ZSKOFZA" width="500px" height="150px"/>

IntelligentCHILD (Community Health Information Local Database) is an semantic search engine indexing curated resources and content in an intuitive format for mothers, children and families.

- Query a curated datbase of resources/content with natural language prompts
- Create user accounts to revisit past queries and saved resources/content
- Includes CRUD portal for admins to manage content

## Screenshots  

<img src="https://raw.githubusercontent.com/oliviahealth/ichild/main/src/assets/screenshots/Screenshot%202024-05-19%20at%203.40.50%20PM.png?token=GHSAT0AAAAAACF66JDCZDABJJSIIGJAFVI6ZSKODQA" />

<img src="https://raw.githubusercontent.com/oliviahealth/ichild/main/src/assets/screenshots/Screenshot%202024-05-19%20at%203.41.40%20PM.png?token=GHSAT0AAAAAACF66JDDMANSAMH4WGDYEXAQZSKOFMQ" />

<img src="https://raw.githubusercontent.com/oliviahealth/ichild/main/src/assets/screenshots/Screenshot%202024-05-19%20at%203.42.46%20PM.png?token=GHSAT0AAAAAACF66JDDJMAWNP5X76YX7ON6ZSKOCBA" />

## Tech Stack  

**Client:** TypeScript, React, React Query, Zod, Zustand

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
