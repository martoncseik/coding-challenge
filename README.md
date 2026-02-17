# Caseworkers' Task Tracker

A simple full-stack task management web application demonstrating development skills and best coding practices. Users can create, view, update, and delete tasks.

## Prerequisites

- Node.js v22.17.0
- Python v3.13.5

## Tech Stack

- Frontend: React, MUI, Axios
- Backend: Django REST Framework, django-cors-headers
- Database: SQLite

## Setup and Run

### Backend (macOS)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 manage.py migrate
python3 manage.py runserver
```

### Backend (Windows)

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend (macOS/Windows)

```bash
cd frontend
npm install
npm run dev
```

## API Documentation

Open these URLs when the backend is running at http://localhost:8000:

- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/
- OpenAPI JSON: http://localhost:8000/api/schema/

## Production Deployment Notes

Remove `CORS_ALLOW_ALL_ORIGINS = True` from `settings.py` and add a strict allowlist:

```python
CORS_ALLOWED_ORIGINS = ["https://example.com"]
```

## Assumptions

- The requirements did not define task statuses, so the following enumeration is used: Not Started, In Progress, On Hold, In Review, Completed.
- Based on “The backend should be able to update the status of a task,” the app only allows updating the `status` field of tasks.
- No auth is implemented, errors are displayed to the user with basic `alert()`, and many other 'quality of life' features are not implemented to focus on CRUD functionality and user experience without over-engineering the app.