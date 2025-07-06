# 🧠 AI-Powered Smart Todo List

This is a full-stack web application for intelligent task management, built with Django and Next.js, and supercharged with Google's Gemini API. The system uses daily context (messages, emails, notes) to provide smart task suggestions, helping users prioritize and organize their work more effectively.

This project was built as a technical assignment.

---

## ✨ Key Features

- **AI Task Suggestions**: Get intelligent recommendations for task descriptions, priority, categories, and deadlines.
- **AI Scheduling Assistant**: The AI suggests an optimal time to work on your tasks based on your context.
- **Context-Aware Analysis**: The AI automatically analyzes your notes and messages for sentiment and keywords, displaying the insights directly in the UI.
- **Dynamic Filtering**: Easily filter tasks by category, status, or priority on the main dashboard.
- **Dark Mode**: A sleek, user-friendly dark mode for comfortable viewing.
- **Data Portability**: Export your tasks to CSV for backup or import tasks from a CSV file with flexible date parsing.
- **Full CRUD Functionality**: A polished UI with modals and instant feedback for creating, reading, updating, and deleting tasks.

---

## 🛠️ Tech Stack

- **Backend**: Django REST Framework
- **Frontend**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Google Gemini API
- **Python Environment**: `uv`

---

## 📸 Screenshots

_(Please add screenshots of the application here. For example:)_

**Dashboard View (Light & Dark Mode)**  
![Dashboard](link-to-your-screenshot.png)

**Add Task Modal with AI Suggestions**  
![Task Editor](link-to-your-screenshot.png)

**Context Hub with AI Insights**  
![Context Hub](link-to-your-screenshot.png)

---

## ⚙️ Setup and Installation

Follow these instructions to get the project running on your local machine.

### Prerequisites

- Python 3.10+
- [Node.js](https://nodejs.org/en/) (v18.0 or newer)
- `uv` Python package manager ([Installation Guide](https://github.com/astral-sh/uv))
- A [Supabase](https://supabase.com/) account for the database.

### 1. Backend Setup (Django)

```bash
# Clone the repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
uv venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\Activate.ps1`

# Install dependencies
uv pip install -r requirements.txt

# Set up your environment variables
cp .env.example .env
```

Your `backend/.env` file should look like this, with your actual credentials:

```
# Get this from your Google AI Studio dashboard
GEMINI_API_KEY="your-gemini-api-key"

# Get these from your Supabase Project -> Settings -> Database
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="your-supabase-db-password"
DB_HOST="your-supabase-db-host"
DB_PORT="your-supabase-db-port"
```

```bash
# Apply database migrations to your Supabase instance
python manage.py makemigrations
python manage.py migrate

# Run the backend server
python manage.py runserver
```

The backend will be available at `http://127.0.0.1:8000`.

### 2. Frontend Setup (Next.js)

```bash
# Navigate to the frontend directory from the root
cd frontend

# Install dependencies
npm install

# Run the frontend development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

---

## 📖 API Documentation

The backend provides the following RESTful API endpoints.

| Endpoint               | Method   | Description                                    |
| ---------------------- | -------- | ---------------------------------------------- |
| `/api/tasks/`          | `GET`    | Retrieve a list of all tasks.                  |
| `/api/tasks/`          | `POST`   | Create a new task.                             |
| `/api/tasks/{id}/`     | `GET`    | Retrieve a single task by its ID.              |
| `/api/tasks/{id}/`     | `PATCH`  | Partially update a task.                       |
| `/api/tasks/{id}/`     | `DELETE` | Delete a task.                                 |
| `/api/tasks/import/`   | `POST`   | Bulk import tasks from a JSON payload.         |
| `/api/categories/`     | `GET`    | Retrieve all task categories.                  |
| `/api/context/`        | `GET`    | Retrieve all context entries.                  |
| `/api/context/`        | `POST`   | Create a new context entry (with AI analysis). |
| `/api/ai/suggestions/` | `POST`   | Get AI-powered suggestions for a task.         |

### Example: Get AI Suggestions

**Request:** `POST /api/ai/suggestions/`

```json
{
  "title": "Organize team meeting",
  "description": "schedule a meeting with the dev team to discuss project progress"
}
```

**Response:**

```json
{
  "enhanced_description": "Schedule a meeting with the development team to review and discuss the progress of the current project, focusing on key milestones and potential blockers.",
  "suggested_categories": ["meeting", "team", "project management"],
  "suggested_deadline": "in 2 days",
  "priority_score": 4,
  "scheduling_suggestion": "Tomorrow morning for 1 hour"
}
```

---

## 🧪 Sample Data for Testing

### Sample Context Data

You can use the **Context Hub** page to add the following entries to test the AI's understanding:

**Entry 1 (Email):**

> Subject: Urgent: Project Phoenix Deadline approaching
> Hi team, just a reminder that the final deadline for Project Phoenix is next Friday. We are still waiting on the final design assets from the client. I've followed up with them this morning. Please make sure all your development tasks are wrapped up by Wednesday.

**Entry 2 (Note):**

> Meeting with marketing was productive. They want to launch the new campaign in two weeks. I need to prepare the presentation slides and coordinate with the social media team. This is a top priority.

### Sample Task and AI Suggestions

After adding the context above, try creating a new task with the following title:

- **Title:** `Prepare campaign presentation`

The AI should provide suggestions that reflect the urgency and context from your notes, such as:

- **Enhanced Description:** "Prepare and finalize the presentation slides for the new marketing campaign launch."
- **Suggested Categories:** `marketing`, `presentation`, `campaign`
- **Priority Score:** `5`
- **Scheduling Suggestion:** "Block out 2 hours tomorrow afternoon for this."
