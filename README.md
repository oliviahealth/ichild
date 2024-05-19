
  # VS Code Readme Editor 📝  
  Import your existing Readme using the import button at the bottom, 
  or create a new Readme from scratch by typing in the editor.  
  
  ## Get Started 🚀  
  To get started, hit the 'clear' button at the top of the editor!  
  
  ## Prebuilt Components/Templates 🔥  
  You can checkout prebuilt components and templates by clicking on the 'Add Section' button or menu icon
  on the top left corner of the navbar.
      
  ## Save Readme ✨  
  Once you're done, click on the save button to download and save your ReadMe!
  <img src="https://raw.githubusercontent.com/oliviahealth/ichild/main/src/assets/logos/TAMU-ichild_logo.png?token=GHSAT0AAAAAACF66JDD2HIVDWC6VYUSREKCZSKNKGA" width="500px" height="150px"/>

IntelligentCHILD (Community Health Information Local Database) is an semantic search engine indexing curated resources and content in an intuitive format for mothers, children and families.

- Query a curated datbase of resources/content with natural language prompts
- Create user accounts to revisit past queries and saved resources/content
- Includes CRUD portal for admins to manage content

## Screenshots  

![App Screenshot](https://raw.githubusercontent.com/oliviahealth/ichild/main/src/assets/screenshots/Screenshot%202024-05-19%20at%203.40.50%20PM.png?token=GHSAT0AAAAAACF66JDC33GDOYF6PHFEQIWWZSKNOPQ)

![App Screenshot](https://raw.githubusercontent.com/oliviahealth/ichild/main/src/assets/screenshots/Screenshot%202024-05-19%20at%203.41.40%20PM.png?token=GHSAT0AAAAAACF66JDDC33KVX2CT7FRYLCGZSKNOXQ)

![App Screenshot](https://raw.githubusercontent.com/oliviahealth/ichild/main/src/assets/screenshots/Screenshot%202024-05-19%20at%203.42.46%20PM.png?token=GHSAT0AAAAAACF66JDDROZFXVTRH4HY4XV4ZSKNO4A)

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
