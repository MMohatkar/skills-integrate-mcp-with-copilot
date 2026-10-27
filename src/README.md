# Mergington High School Activities API

A super simple FastAPI application that allows students to view and sign up for extracurricular activities.

## Features

- View all available extracurricular activities
- Teacher-only sign up and unregister controls

## Getting Started

1. Install the dependencies:

   ```
   pip install fastapi uvicorn
   ```

2. Set credentials for the teacher account in the environment. Do not commit credentials:

   ```
   export TEACHER_USERNAME=teacher
   export TEACHER_PASSWORD='choose-a-strong-password'
   ```

3. Run the application:

   ```
   python app.py
   ```

4. Open your browser and go to:
   - API documentation: http://localhost:8000/docs
   - Alternative documentation: http://localhost:8000/redoc

## API Endpoints

| Method | Endpoint                                                          | Description                                                         |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/activities`                                                     | Get all activities with their details and current participant count |
| POST   | `/auth/login`                                                     | Verify teacher credentials using HTTP Basic authentication          |
| POST   | `/activities/{activity_name}/signup?email=student@mergington.edu` | Sign up for an activity (teacher authentication required)            |
| DELETE | `/activities/{activity_name}/unregister?email=student@mergington.edu` | Unregister a student (teacher authentication required)            |

Activity viewing remains public. Registration changes require the configured teacher username and password. The browser keeps the login credentials in memory only, so refreshing the page logs the teacher out. Use HTTPS when exposing the app beyond local development because HTTP Basic credentials are sent with each write request.

## Data Model

The application uses a simple data model with meaningful identifiers:

1. **Activities** - Uses activity name as identifier:

   - Description
   - Schedule
   - Maximum number of participants allowed
   - List of student emails who are signed up

2. **Students** - Uses email as identifier:
   - Name
   - Grade level

All data is stored in memory, which means data will be reset when the server restarts.
