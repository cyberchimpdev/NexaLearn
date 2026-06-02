# NexaLearn / NextLearn

AI-powered learning gap detector + interest-based personalized learning platform.

## Stack

- Frontend: React + Vite + Tailwind CSS + React Router + Axios + Recharts + Lucide React
- Backend: Python Django + Django REST Framework + Simple JWT + SQLite
- AI: Python rule-based MVP agent with optional LLM integration later

## Core demo flow

1. Teacher registers/logs in.
2. Teacher creates a class-wise test.
3. Student registers/logs in and selects interests.
4. Student attempts the test.
5. Python AI agent analyzes answers, detects mistakes, weak concepts, and generates interest-based explanations.
6. Student sees recovery card.
7. Teacher sees class report and remedial groups.

## Run backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

## Run frontend

```bash
cd frontend
npm install
npm run dev
```
