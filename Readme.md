# AI Support Triage & Recovery Hub

This is a Full Stack MVP designed to asynchronously ingest user complaints, categorize them, score their sentiment and urgency, and draft responses using Generative AI (Gemini 2.5 Flash).

## 🏗 Architecture & Stack
- **Frontend:** Next.js (App Router)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (managed with Prisma ORM)
- **Queue/Background Worker:** Redis + BullMQ
- **AI Integration:** Google Gemini API (`gemini-2.5-flash`)
- **Containerization:** Docker & Docker Compose

## 🚀 Key Engineering Decisions
To satisfy the strict "Bottle-Neck" constraint (non-blocking HTTP response):
1. **Separation of Concerns:** The application is split into an `api` container and a `worker` container within Docker.
2. **Asynchronous Processing:** The `POST /tickets` endpoint immediately saves a `PENDING` state to the DB, enqueues a job to Redis, and returns a `201 Created` instantly.
3. **Dedicated AI Worker:** A standalone BullMQ worker picks up jobs from Redis, interacts with the Gemini LLM (enforcing strict JSON output via `responseMimeType`), and updates the database independently.

---

## 🛠 Setup & Installation Instructions

### Prerequisites
- **Node.js** installed on your machine.
- **Docker** and **Docker Compose** installed and running.
- A valid **Google Gemini API Key**.

### Step 1: Configure API Key
Create a `.env` file in the root directory (or inject it into your environment) with your API key:
\`\`\`env
GEMINI_API_KEY=your_actual_gemini_api_key_here
\`\`\`
*(Note: For the ease of this technical review, you can also paste the API key directly into the `docker-compose.yml` file under the `backend-worker` environment variables, replacing `YOUR_API_KEY_HERE`. **Please remember to revoke or remove the actual key before making this repo public!**).*

### Step 2: Install Local Dependencies
To ensure your local IDE (like VS Code or Cursor) resolves the code properly, install the dependencies for both environments. Open your terminal in the root folder:

\`\`\`bash
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
\`\`\`

### Step 3: Run the Infrastructure (Docker)
Open your terminal in the root folder and start the backend ecosystem:
\`\`\`bash
docker-compose up --build
\`\`\`
This command will:
- Spin up the PostgreSQL and Redis containers.
- Build the Node.js backend.
- Automatically sync the database schema to create the `Ticket` table.
- Start the API server on **Port 4000**.
- Start the background AI Worker queue.

### Step 4: Run the Frontend
Open a **new terminal window**, navigate to the frontend folder, and start the Next.js app:
\`\`\`bash
cd frontend
npm run dev
\`\`\`
The frontend dashboard will now be available at **http://localhost:3000**.

---

## 🧪 How to Test
1. Visit `http://localhost:3000` in your browser.
2. Submit a sample complaint in the text area (e.g., *"My internet has been down for 2 days, the technician didn't show up, and I want a refund immediately!"*).
3. Click **Submit**. Notice that the UI responds with a success message instantly (proving the non-blocking constraint).
4. Wait 3-5 seconds and check the dashboard. The background worker will have processed the ticket, assigning it an Urgency (e.g., High/Red), a Sentiment score, and an AI-drafted reply.