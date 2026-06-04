# NexaLearn

NexaLearn is an AI-powered learning gap detection and recovery platform for students and teachers. It helps teachers create diagnostic tests, analyzes student answers, detects weak concepts, explains mistakes, and gives students focused recovery tasks.

The platform is designed to support classroom learning. Teachers can understand where students are struggling, while students receive clear feedback on what went wrong and what they should revise next.

## Project Description

Traditional test systems usually show only marks or scores. NexaLearn goes further by analyzing the reason behind a student’s mistake. When a student submits an answer, the system identifies the weak concept, mistake type, explanation, and next recovery task.

NexaLearn is built around the idea that every wrong answer contains useful learning data. Instead of treating mistakes as failure, the platform converts them into a personalized learning path.

## Main Users

## Students

Students can use NexaLearn to:

- Attempt teacher-created diagnostic tests
- Generate AI practice tests
- Submit answers for AI evaluation
- View weak concepts
- Understand mistakes with simple explanations
- Receive recovery tasks
- Use Tutor AI for study help
- Track reports and progress

## Teachers

Teachers can use NexaLearn to:

- Create diagnostic tests
- Add questions, correct answers, marks, and explanations
- View student attempts
- Analyze weak concepts
- Review class performance
- Identify common mistake patterns
- Plan remedial teaching groups

## Core Features

## Diagnostic Test Creation

Teachers can create tests by adding the title, subject, topic, grade level, duration, questions, correct answers, marks, and explanations. These tests are used to detect learning gaps.

## Student Test Attempt

Students can view available tests, answer questions, and submit their responses. After submission, the system analyzes their answers and generates feedback.

## AI Answer Analysis

NexaLearn analyzes student answers and compares them with correct answers. It identifies whether the answer is correct, partially correct, or incorrect.

## Weak Concept Detection

The platform detects the concept the student is struggling with. This helps students know exactly what to revise instead of studying the whole chapter again.

## Mistake Explanation

Students receive simple explanations showing what went wrong, why the correct answer is better, and how they can avoid the same mistake next time.

## Recovery Tasks

For every weak concept, NexaLearn creates a focused recovery task. These tasks guide students toward targeted revision and practice.

## AI Practice Test

Students can generate practice tests based on class, subject, topic, difficulty, number of questions, and marks. The generated test can be submitted for AI evaluation.

## Tutor AI Chatbot

Tutor AI helps students ask study-related questions. It gives direct answers, simple explanations, step-by-step reasoning, and examples based on the student’s learning profile.

## Student Reports

Students can view their test attempts, average score, weak concepts, mistake patterns, and recovery tasks from the reports page.

## Teacher Reports

Teachers can view test reports, student attempts, average score, weak concepts, and remedial group suggestions.

## Learning Profile

Students can set their class level, learning style, interests, preferred subjects, weak subjects, daily goal, and preferred explanation length. This helps the system personalize explanations.

## Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React

## Backend

- Python
- Django
- Django REST Framework
- SimpleJWT
- SQLite for development
- Django CORS Headers

## AI Integration

- Gemini API for chatbot responses
- Gemini API for question generation
- Gemini API for answer explanation and quiz evaluation
- Local fallback system for stable functionality when AI is unavailable

## Project Structure

```txt
NexaLearn/
├── Backend/
│   ├── apps/
│   │   ├── accounts/
│   │   ├── personalization/
│   │   ├── tests_app/
│   │   ├── attempts/
│   │   ├── reports/
│   │   └── ai_agent/
│   ├── nexalearn_backend/
│   ├── manage.py
│   └── requirements.txt
│
└── Frontend/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── context/
    │   ├── layouts/
    │   ├── pages/
    │   │   ├── auth/
    │   │   ├── student/
    │   │   └── teacher/
    │   ├── services/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

## Main Routes

## Public Routes

- `/`
- `/login`
- `/register`

## Student Routes

- `/student`
- `/student/profile`
- `/student/tests`
- `/student/tests/:testId`
- `/student/ai-practice`
- `/student/reports`
- `/student/reports/:attemptId/mistakes`
- `/student/ai`

## Teacher Routes

- `/teacher`
- `/teacher/tests/create`
- `/teacher/tests/:testId/report`

## Setup Instructions

## Backend Setup

```bash
cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

## Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

## Environment Variables

Create a `.env` file inside the `Backend` folder.

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

## GitHub Repository Description

AI-powered learning gap detection and recovery platform built with React, Tailwind CSS, Django REST Framework, and Gemini API.

## Short Description

AI-powered learning gap detector for students and teachers.
