# NexaLearn

## AI-Powered Learning Gap Detector & Personalized Learning Recovery Platform

NexaLearn is a full-stack education platform designed to help teachers identify student learning gaps and help students recover through personalized AI-generated feedback, revision tasks, and interest-based explanations.

The system allows teachers to create diagnostic tests, students to submit answers, and an AI Agent to analyze mistakes, weak concepts, and learning needs within seconds.

Developed for an education-focused hackathon using React, Tailwind CSS, Python, Django, and AI Agent support.

---

## 1. Executive Summary

Many students do not hate learning; they struggle because the learning format does not connect with them. Traditional study material often feels boring, abstract, and disconnected from real life.

Teachers also face difficulty identifying every student’s exact weakness because manually checking answers, analyzing mistakes, and preparing personalized revision tasks takes too much time.

NexaLearn addresses this problem by providing:

- Diagnostic test creation
- AI-based answer analysis
- Weak concept detection
- Mistake type identification
- Personalized revision tasks
- Interest-based explanations
- Teacher reports and remedial groups
- Gemini-powered study chatbot support

The platform is built with a scalable full-stack architecture using React, Tailwind CSS, Django REST Framework, and AI Agent logic.

---

## 2. My Role & Contribution

Frontend Development, UI/UX Design, Backend Planning & AI Workflow Structuring

Primary responsibilities:

- Designed and implemented the React frontend using Vite
- Built reusable frontend components
- Structured pages, layouts, routes, services, and context folders
- Designed a modern Tailwind CSS-based user interface
- Planned teacher and student dashboard flows
- Integrated frontend service layer for backend API communication
- Added AI chatbot UI as a floating bottom-right assistant
- Structured the AI Agent workflow for answer analysis and feedback
- Planned backend modules using Django and Django REST Framework

My focus was on creating a clean, modern, responsive, and hackathon-ready learning platform that is easy for teachers and students to use.

---

## 3. System Architecture Overview

The system follows a modular full-stack architecture:

```txt
Frontend (React + Tailwind CSS)
        ↓
Django REST API
        ↓
Database + Python AI Agent
        ↓
Gemini API Chatbot Support
```

Key Components:

- Teacher dashboard
- Student dashboard
- Diagnostic test module
- Attempt submission module
- AI answer analysis system
- Weak concept detection
- Revision task generator
- Floating AI chatbot
- Teacher reporting system

---

## 4. Core Functional Modules

### 4.1 Diagnostic Test System

Teachers can create class-wise diagnostic tests to check student understanding.

Main Features:

- Create tests
- Add questions
- Assign marks
- Manage class-wise assessment
- View submitted attempts

Expected Backend Flow:

```txt
POST /api/tests/
GET /api/tests/
GET /api/tests/:id/
```

Response Includes:

- Test title
- Subject
- Questions
- Marks
- Assigned class
- Created teacher

---

### 4.2 Student Attempt System

Students can view available tests and submit answers.

Main Features:

- View assigned tests
- Attempt questions
- Submit answers
- Receive AI-generated feedback
- View weak concepts and revision tasks

Expected Endpoint:

```txt
POST /api/attempts/submit/
```

Submission Includes:

- Test ID
- Student answers
- Question IDs
- Student profile and interests

---

### 4.3 AI Agent Answer Analysis

The AI Agent analyzes student answers and generates structured feedback.

AI Agent Responsibilities:

- Check answer correctness
- Suggest score
- Detect mistake type
- Identify weak concept
- Explain the mistake
- Generate correct solution
- Create revision task
- Personalize explanation based on student interest

Example AI Output:

```json
{
  "is_correct": false,
  "score": 2,
  "mistake_type": "conceptual_error",
  "weak_concept": "Photosynthesis",
  "reason": "The student confused chlorophyll with stomata.",
  "correct_solution": "Chlorophyll absorbs light energy required for photosynthesis.",
  "revision_task": "Revise the role of chlorophyll and write two differences between chlorophyll and stomata."
}
```

---

### 4.4 Interest-Based Learning

NexaLearn makes explanations more relatable by connecting academic concepts with student interests.

Example Interests:

- Anime
- Cricket
- Gaming
- Movies
- Real-life examples

Example:

If a student likes anime, the AI can explain energy transfer like a power system.
If a student likes cricket, the AI can explain strategy-based concepts through match situations.

This makes learning more engaging without changing the academic meaning.

---

### 4.5 Gemini AI Chatbot

The platform includes a Gemini-powered chatbot as a support feature.

Behavior:

- Appears as a small floating icon at the bottom-right
- Opens into a compact professional chatbot popup
- Helps students ask study-related questions
- Sends requests through Django backend
- Does not expose the Gemini API key in frontend

Expected Endpoint:

```txt
POST /api/ai/chat/
```

Correct Flow:

```txt
React Frontend → Django Backend → Gemini API → Django Backend → React Frontend
```

---

### 4.6 Teacher Reports

Teachers can view class performance and learning gaps.

Report Includes:

- Average score
- Weak topics
- Mistake distribution
- Student-wise performance
- Remedial groups
- Concepts needing revision

Expected Endpoints:

```txt
GET /api/reports/teacher/overview/
GET /api/reports/tests/:testId/
```

---

## 5. Technology Stack

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
- SimpleJWT
- Django CORS Headers
- SQLite for development
- Gemini API

### AI

- Custom Python AI Agent
- Gemini API chatbot
- Prompt-based answer analysis
- Structured JSON feedback

---

## 6. Code Structure

Current frontend structure:

```txt
Frontend/
├── node_modules/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
└── tailwind.config.js
```

Recommended backend structure:

```txt
Backend/
├── manage.py
├── requirements.txt
├── .env.example
├── nexalearn_backend/
├── accounts/
├── personalization/
├── tests_app/
├── attempts/
├── reports/
└── ai_agent/
```

The project follows separation of concerns and modular architecture for scalability.

---

## 7. Local Development Setup

### Prerequisites

- Node.js 18+
- npm
- Python 3.10+
- pip
- Virtual environment

---

### Frontend Installation

```bash
cd Frontend
npm install
npm run dev
```

Runs on:

```txt
http://localhost:5173
```

Frontend environment file:

```txt
Frontend/.env
```

Add:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

---

### Backend Installation

```bash
cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

Runs on:

```txt
http://127.0.0.1:8000
```

Backend environment file:

```txt
Backend/.env
```

Add:

```env
SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
GEMINI_API_KEY=your_gemini_api_key
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## 8. Functional Test Example

Input:

```txt
Question: What is the role of chlorophyll in photosynthesis?
Correct Answer: Chlorophyll absorbs light energy required for photosynthesis.
Student Answer: Chlorophyll helps the plant breathe through stomata.
```

Output:

```txt
Mistake Type: Conceptual Error
Weak Concept: Function of chlorophyll
Feedback: The student confused chlorophyll with stomata.
Revision Task: Revise chlorophyll, chloroplast, and stomata with two differences.
```

Additional tests:

- Teacher test creation
- Student answer submission
- AI feedback generation
- Student report page
- Teacher weak-topic dashboard
- Gemini chatbot query

---

## 9. Problem Impact & Vision

Target Users:

- Students
- Teachers
- Schools
- Coaching institutes
- Exam preparation platforms

Impact Goal:

Enable teachers to identify:

- Who is weak
- Where they are weak
- Why they are weak
- What they should revise next

Enable students to receive:

- Clear feedback
- Personalized explanation
- Revision task
- Better learning direction

NexaLearn aims to make learning recovery faster, more personal, and more actionable.

---

## 10. Future Roadmap

- PDF report export
- Parent dashboard
- Adaptive quiz generation
- Multi-language explanation
- Voice-based learning assistant
- Gamified revision streaks
- NEB, SAT, IELTS, and PTE practice modes
- PostgreSQL production database
- Advanced analytics dashboard
- Mobile application version

---

## 11. Author

NexaLearn Team

Role:

- Frontend Development
- UI/UX Design
- Backend Planning
- AI Agent Workflow Design

GitHub:

```Asim Pun Magar
https://github.com/cyberchimpdev
```

---

## 12. License

This project is open-source and available for educational and hackathon use.

---

## Final Message

NexaLearn is not just an AI chatbot.
It is a learning recovery platform that helps teachers understand student weaknesses and helps students improve through personalized, AI-guided revision.
