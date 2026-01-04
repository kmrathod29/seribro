# SeriBro

SeriBro is a full-stack web application built with a Node.js backend and a modern frontend.

---

## 📁 Project Structure

phase2.1/
├── seribro-backend/
└── seribro-frontend/
└── client/

yaml
Copy code

---

## ⚙️ Backend Setup (seribro-backend)

### Step 1: Navigate to backend folder

```bash
cd phase2.1/seribro-backend
Step 2: Install dependencies

bash
Copy code
npm install


Step 3: Environment Variables
Create a .env file in the seribro-backend folder using .env.example.

bash
Copy code
cp .env.example .env
Fill in the required values (database, JWT, email, etc.).

🎨  Step 4: Start backend server
bash
Copy code
npm start
Backend will run on:

arduino
Copy code
http://localhost:7000


🎨 Frontend Setup (seribro-frontend)
Step 1: Navigate to frontend folder

bash
Copy code
cd phase2.1/seribro-frontend/client

Step 2: Install dependencies
bash
Copy code
npm install

Step 3: Start frontend development server
bash
Copy code
npm run dev
Frontend will run on:

arduino
Copy code
http://localhost:5173


🚀 How to Push Code Changes
Step 1: Check changed files
git status

Step 2: Add changes
git add .

Step 3: Commit changes
git commit -m "Describe your changes here"

Step 4: Push to GitHub
git push origin main


If Git shows a non-fast-forward error:

git pull origin main --rebase
git push origin main

git reset --hard origin/main

🚫 Ignored & Sensitive Files
For security and performance reasons, the following files are not included in the repository:

node_modules/

.env

dist/

build/

.vscode/


📌 Important Notes
Node.js must be installed on your system

Do not commit .env files

Use .env.example as a reference

Run backend and frontend in separate terminals

🧑‍💻 Author
Arman Mahetar and Krunal Rathod


cd .\seribro-backend
cd .\seribro-frontend\client

py-[160px]