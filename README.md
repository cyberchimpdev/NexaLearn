# NexaLearn — AI-Powered Learning Gap Detector

NexaLearn is a human-centered AI learning recovery platform built for teachers and students.
It helps teachers create diagnostic tests, analyzes student mistakes using a Python AI Agent, detects weak concepts, generates personalized revision tasks, and groups students with similar learning gaps for targeted remediation.

> Core idea: Students do not hate learning; they often hate learning in a format that does not connect with them. NexaLearn turns academic content into personalized, interest-based learning recovery while keeping teachers in control.

---

## Project Summary

NexaLearn solves three major education pain points:

1. **Low engagement with traditional study material**
2. **Abstract concepts feeling disconnected from real life**
3. **Teachers lacking time to personalize learning for every student**

The platform allows teachers to create class-wise diagnostic tests. Students attempt those tests, and the AI Agent analyzes every answer to identify:

- Correctness
- Score
- Mistake type
- Weak concept
- Reason for the mistake
- Correct solution
- Personalized revision task
- Interest-based explanation

Teachers then receive reports, weak-topic analytics, mistake distribution, and remedial student groups.

---

## Main Features

### Teacher Features

- Secure teacher registration and login
- Teacher dashboard
- Create class-wise diagnostic tests
- Add questions with correct answers and marks
- View student submissions
- See class average performance
- Detect common weak topics
- View mistake type distribution
- Generate remedial groups
- Track student improvement over time

### Student Features

- Secure student registration and login
- Student dashboard
- Set learning preferences and interests
- Attempt assigned tests
- Submit written or objective answers
- Receive AI-generated feedback
- View weak concepts
- Get personalized revision tasks
- Receive interest-based explanations
- Use Gemini-powered AI chatbot for study support

### AI Agent Features

- Answer checking
- Mistake diagnosis
- Weak concept detection
- Marks allocation
- Revision task generation
- Class-wise explanation adaptation
- Interest-based explanation generation
- Teacher report support
- Remedial group recommendation

### Gemini Chatbot Features

- Floating bottom-right chatbot icon
- Compact professional popup UI
- Student study support
- Connected through Django backend
- API key never exposed in frontend
- Works as a support feature, not the main product

---

## Unique Selling Point

Most education tools give students generic content or basic chatbot answers. NexaLearn focuses on **learning recovery**.

It does not only say whether an answer is wrong. It identifies **why** the student is wrong, what concept is weak, what type of mistake happened, and what the student should revise next.

NexaLearn also personalizes explanations using student interests such as:

- Anime power systems
- Cricket strategies
- Gaming levels
- Movie stories
- Real-life examples

This makes difficult academic concepts easier to understand without replacing the teacher.

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- lucide-react
- Recharts

### Backend

- Python
- Django
- Django REST Framework
- SimpleJWT Authentication
- Django CORS Headers
- SQLite for hackathon/development
- PostgreSQL-ready architecture
- Jazzmin Admin

### AI

- Custom Python AI Agent
- Gemini API chatbot
- Structured JSON response format
- Backend-secured API integration

---

## System Architecture

```text
Student / Teacher
       |
       v
React + Tailwind Frontend
       |
       v
Django REST Framework API
       |
       |-----------------------------|
       |                             |
       v                             v
Database                     Python AI Agent
SQLite / PostgreSQL          Mistake Analysis
                              Weak Concept Detection
                              Revision Task Generation
                              Interest-Based Explanation
       |
       v
Gemini API Chatbot
Study Assistant through Backend
```

---

## Core Workflow

```text
1. Teacher creates a class-wise diagnostic test
2. Student attempts the test
3. Student submits answers
4. Django backend stores the attempt
5. Python AI Agent analyzes each answer
6. AI detects mistake type and weak concept
7. Student receives revision card
8. Teacher receives class report and remedial groups
```

---

## Recommended Folder Structure

```text
nexalearn/
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── nexalearn_backend/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   │
│   ├── accounts/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── permissions.py
│   │
│   ├── personalization/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── tests_app/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── attempts/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── reports/
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   └── ai_agent/
│       ├── agent.py
│       ├── gemini_client.py
│       ├── prompts.py
│       ├── serializers.py
│       ├── views.py
│       └── urls.py
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api/
│       │   ├── axios.js
│       │   ├── authApi.js
│       │   ├── testApi.js
│       │   ├── attemptApi.js
│       │   └── aiApi.js
│       │
│       ├── components/
│       │   ├── common/
│       │   │   ├── Button.jsx
│       │   │   ├── Input.jsx
│       │   │   ├── Card.jsx
│       │   │   ├── Badge.jsx
│       │   │   └── Loader.jsx
│       │   │
│       │   ├── layout/
│       │   │   ├── DashboardLayout.jsx
│       │   │   ├── Navbar.jsx
│       │   │   ├── Sidebar.jsx
│       │   │   └── Footer.jsx
│       │   │
│       │   ├── ai/
│       │   │   └── FloatingAIChatbot.jsx
│       │   │
│       │   ├── reports/
│       │   │   ├── WeakTopicChart.jsx
│       │   │   ├── MistakeDistributionChart.jsx
│       │   │   └── RemedialGroupCard.jsx
│       │   │
│       │   └── tests/
│       │       ├── QuestionCard.jsx
│       │       ├── TestCard.jsx
│       │       └── RevisionTaskCard.jsx
│       │
│       ├── pages/
│       │   ├── public/
│       │   │   ├── Home.jsx
│       │   │   ├── Login.jsx
│       │   │   └── Register.jsx
│       │   │
│       │   ├── teacher/
│       │   │   ├── TeacherDashboard.jsx
│       │   │   ├── CreateTest.jsx
│       │   │   └── TestReport.jsx
│       │   │
│       │   └── student/
│       │       ├── StudentDashboard.jsx
│       │       ├── StudentProfile.jsx
│       │       ├── StudentTests.jsx
│       │       ├── AttemptTest.jsx
│       │       ├── StudentReports.jsx
│       │       └── StudentAI.jsx
│       │
│       ├── routes/
│       │   ├── ProtectedRoute.jsx
│       │   └── RoleBasedRoute.jsx
│       │
│       ├── context/
│       │   └── AuthContext.jsx
│       │
│       └── utils/
│           ├── constants.js
│           └── helpers.js
│
├── .gitignore
└── README.md
```

---

## Frontend Routes

### Public Routes

| Route       | Page         |
| ----------- | ------------ |
| `/`         | Landing page |
| `/login`    | Login        |
| `/register` | Register     |

### Teacher Routes

| Route                           | Page              |
| ------------------------------- | ----------------- |
| `/teacher`                      | Teacher dashboard |
| `/teacher/tests/create`         | Create test       |
| `/teacher/tests/:testId/report` | Test report       |

### Student Routes

| Route                    | Page                          |
| ------------------------ | ----------------------------- |
| `/student`               | Student dashboard             |
| `/student/profile`       | Student profile and interests |
| `/student/tests`         | Available tests               |
| `/student/tests/:testId` | Attempt test                  |
| `/student/reports`       | Student learning reports      |
| `/student/ai`            | AI study assistant            |

---

## Backend Apps

### `accounts`

Handles authentication, user roles, JWT login/register, teacher/student separation.

### `personalization`

Stores student interests, learning preferences, class level, and personalization data.

### `tests_app`

Handles test creation, questions, marks, subjects, topics, and class-wise test assignment.

### `attempts`

Handles student submissions, answer storage, AI analysis results, and attempt scores.

### `reports`

Generates teacher dashboards, weak-topic reports, mistake distribution, and remedial groups.

### `ai_agent`

Contains the Python AI Agent, Gemini integration, prompts, structured answer analysis, and chatbot endpoint.

---

## AI Agent JSON Output Format

The AI Agent should return structured JSON like this:

```json
{
  "is_correct": false,
  "score": 2,
  "max_score": 5,
  "mistake_type": "conceptual_error",
  "weak_concept": "Photosynthesis light reaction",
  "reason": "The student confused the role of chlorophyll with the role of stomata.",
  "correct_solution": "Chlorophyll absorbs light energy, while stomata help in gas exchange.",
  "personalized_explanation": "Think of chlorophyll like the power source in an anime character. It captures energy first, then the plant uses that energy to make food.",
  "revision_task": "Revise the difference between chlorophyll, chloroplast, and stomata. Then answer two short questions about light reaction."
}
```

---

## Mistake Types

Recommended mistake categories:

```text
conceptual_error
calculation_error
careless_error
incomplete_answer
misread_question
weak_explanation
grammar_or_language_issue
correct
```

---

## Backend Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/nexalearn.git
cd nexalearn/backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
```

### 3. Activate Virtual Environment

#### Windows

```bash
venv\Scripts\activate
```

#### macOS / Linux

```bash
source venv/bin/activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

Recommended `requirements.txt`:

```txt
Django
djangorestframework
djangorestframework-simplejwt
django-cors-headers
python-dotenv
google-generativeai
django-jazzmin
```

### 5. Create `.env`

Create a `.env` file inside the `backend/` directory.

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

GEMINI_API_KEY=your-gemini-api-key

CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Do not push `.env` to GitHub.

### 6. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Superuser

```bash
python manage.py createsuperuser
```

### 8. Start Backend Server

```bash
python manage.py runserver
```

Backend runs at:

```text
http://127.0.0.1:8000/
```

---

## Frontend Setup

### 1. Go to Frontend Directory

```bash
cd ../frontend
```

### 2. Install Dependencies

```bash
npm install
```

Recommended packages:

```bash
npm install axios react-router-dom lucide-react recharts
```

### 3. Create `.env`

Create a `.env` file inside the `frontend/` directory.

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Do not push `.env` to GitHub.

### 4. Start Frontend Server

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173/
```

---

## Important API Endpoints

### Auth

```text
POST /api/accounts/register/
POST /api/accounts/login/
POST /api/token/
POST /api/token/refresh/
```

### Tests

```text
GET    /api/tests/
POST   /api/tests/
GET    /api/tests/:id/
PUT    /api/tests/:id/
DELETE /api/tests/:id/
```

### Attempts

```text
POST /api/attempts/submit/
GET  /api/attempts/my-results/
GET  /api/attempts/:id/
```

### Reports

```text
GET /api/reports/teacher/overview/
GET /api/reports/tests/:testId/
GET /api/reports/remedial-groups/:testId/
```

### AI Agent

```text
POST /api/ai/analyze-answer/
POST /api/ai/chat/
```

---

## Gemini API Integration Rule

The Gemini API key must only be used in the Django backend.

Correct flow:

```text
React UI -> Django API -> Gemini API -> Django API -> React UI
```

Do not call Gemini directly from React because that exposes the API key in the browser.

---

## Example AI Analyze Request

```json
{
  "subject": "Biology",
  "topic": "Photosynthesis",
  "class_level": "Class 10",
  "question": "What is the role of chlorophyll in photosynthesis?",
  "correct_answer": "Chlorophyll absorbs light energy required for photosynthesis.",
  "student_answer": "Chlorophyll helps the plant breathe through stomata.",
  "marks": 5,
  "student_interests": ["anime", "cricket", "gaming"]
}
```

---

## Example AI Analyze Response

```json
{
  "is_correct": false,
  "score": 2,
  "mistake_type": "conceptual_error",
  "weak_concept": "Function of chlorophyll",
  "reason": "The answer confuses chlorophyll with stomata.",
  "correct_solution": "Chlorophyll absorbs sunlight, while stomata help in gas exchange.",
  "personalized_explanation": "In anime terms, chlorophyll is like the energy absorber. It collects the power source first so the plant can produce food.",
  "revision_task": "Write the difference between chlorophyll and stomata in three points."
}
```

---

## Landing Page Structure

The homepage should follow this professional SaaS-style flow:

```text
Hero
Problem
Solution
Workflow
Features
Personalization
Class-wise Learning Recovery
AI Agent Section
Teacher Dashboard Preview
Student Recovery Preview
CTA
Footer
```

Recommended UI direction:

- Blue / indigo / slate color system
- Responsive layout
- Clear typography
- Modern cards
- Soft shadows
- Accessible buttons
- Proper spacing
- Professional dashboard feel
- Floating AI chatbot only on student dashboard pages

---

## Demo Flow for Hackathon

Use this flow while presenting to judges:

```text
1. Open NexaLearn landing page
2. Explain the problem: students struggle because content does not connect with them
3. Login as teacher
4. Create a diagnostic test
5. Login as student
6. Attempt the test and submit answers
7. Show AI answer analysis
8. Show student revision card
9. Show personalized explanation based on interests
10. Go back to teacher dashboard
11. Show weak-topic analytics
12. Show remedial groups
13. Open compact Gemini chatbot as supporting feature
14. End with human-centered AI message
```

---

## Hackathon Pitch

Students do not fail only because they do not study. Many fail because they never understand exactly where their learning gap is.

NexaLearn helps teachers detect those gaps quickly. Teachers create simple diagnostic tests, students submit answers, and our AI Agent identifies weak concepts, mistake types, and personalized revision tasks.

The platform also explains concepts using contexts students already care about, like anime, cricket, gaming, and movies. This keeps learning engaging while keeping teachers in control.

NexaLearn is not a replacement for teachers. It is a learning recovery assistant that helps teachers personalize support at scale.

---

## Environment Variables

### Backend `.env.example`

```env
SECRET_KEY=replace-with-your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

GEMINI_API_KEY=replace-with-your-gemini-api-key

CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend `.env.example`

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

---

## Git Ignore Recommendation

Create a `.gitignore` file in the root directory:

```gitignore
# Python
__pycache__/
*.py[cod]
*.pyo
*.pyd
.Python
venv/
env/
.env
*.sqlite3
db.sqlite3

# Django
media/
staticfiles/
*.log

# Node / React
node_modules/
dist/
build/
.vite/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE / Editor
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db
```

Keep `.env.example` files in GitHub. Never push real `.env` files.

---

## Production Notes

For production deployment:

- Use PostgreSQL instead of SQLite
- Set `DEBUG=False`
- Use strong `SECRET_KEY`
- Configure secure CORS origins
- Store environment variables securely
- Use HTTPS
- Add rate limiting to AI endpoints
- Add role-based permissions
- Add database indexing for reports
- Use `select_related()` and `prefetch_related()` for optimized queries
- Add proper logging and monitoring

---

## Future Improvements

- PDF report export for teachers
- Parent progress dashboard
- Weekly learning recovery plan
- Adaptive quiz generation
- Voice-based explanation mode
- Gamified revision streaks
- Class ranking by improvement, not just marks
- Multi-language explanation support
- NEB / SAT / IELTS mode support
- Advanced analytics with PostgreSQL

---

## License

This project is built for educational and hackathon purposes.
You can customize the license based on your team requirements.

---

## Team

Built by the NexaLearn team for an education-focused hackathon.

---

## Final Message

NexaLearn makes learning recovery faster, more personal, and more actionable.

It helps students understand their mistakes, helps teachers save time, and turns AI into a support system for better education.
