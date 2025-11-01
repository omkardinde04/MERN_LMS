# Learnify Backend API

A comprehensive Node.js/Express backend for the Learnify Learning Management System (LMS).

## Features

- 🔐 JWT-based authentication
- 👥 Role-based access control (Student & Faculty)
- 📚 Course management
- 📝 Assignment submission and grading
- 🤖 AI-powered quiz generation (Gemini API)
- 💻 Code execution (Piston API)
- 🧠 AI code feedback
- 📊 Grade tracking
- 📅 Calendar and timetable management
- 💬 Student feedback system

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **External APIs**: Google Gemini AI, Piston Code Execution

## Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the values:
     - `MONGO_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure random string
     - `GEMINI_API_KEY`: Your Google Gemini API key
     - `CLIENT_URL`: Your frontend URL (default: http://localhost:5173)

3. **Start MongoDB**
   - If using local MongoDB: `mongod`
   - If using MongoDB Atlas: Ensure your IP is whitelisted

4. **Run the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

5. **Test the API**
   - Open http://localhost:5000
   - Visit http://localhost:5000/api/health for health check

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user (Protected)
- `POST /logout` - Logout user (Protected)

### User Management (`/api/users`)
- `PUT /profile` - Update profile
- `PUT /avatar` - Update avatar
- `DELETE /avatar` - Delete avatar
- `PUT /password` - Change password
- `PUT /notifications` - Update notification preferences

### Student Routes (`/api/student`)
- `GET /dashboard` - Get dashboard data
- `GET /courses` - Get enrolled courses
- `GET /assignments` - Get all assignments
- `POST /assignments/:id/submit` - Submit assignment
- `GET /grades` - Get grades
- `GET /calendar` - Get calendar events
- `GET /feedback` - Get feedback
- `POST /feedback` - Create feedback
- `DELETE /feedback/:id` - Delete feedback
- `GET /quizzes` - Get available quizzes

### Faculty Routes (`/api/faculty`)
- `GET /dashboard` - Get dashboard data
- `GET /courses` - Get courses
- `POST /courses` - Create course
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course
- `GET /students` - Get students
- `GET /timetable` - Get timetable
- `POST /timetable` - Create timetable entry
- `DELETE /timetable/:id` - Delete timetable entry
- `GET /assignments` - Get assignments
- `POST /assignments` - Create assignment
- `GET /assignments/:id/submissions` - Get submissions
- `PUT /submissions/:id/grade` - Grade submission
- `POST /announcements` - Create announcement

### Proxy Routes (`/api/proxy`)
- `POST /code/execute` - Execute code via Piston API
- `POST /ai/code-feedback` - Get AI code feedback
- `POST /ai/generate-quiz` - Generate quiz (Faculty only)
- `GET /ai/test` - Test Gemini API connection

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Role-Based Access

- **Student**: Can access `/api/student/*` routes
- **Faculty**: Can access `/api/faculty/*` routes
- Role is determined by the student ID during registration (IDs ending in 0 are students)

## Database Models

- **User**: Student and faculty user accounts
- **Course**: Course information
- **Assignment**: Course assignments
- **Submission**: Assignment submissions
- **Timetable**: Class schedules
- **Feedback**: Student course feedback
- **Quiz**: AI-generated quizzes
- **Announcement**: Course announcements

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `MONGO_URI` | MongoDB connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `GEMINI_API_KEY` | Google Gemini API key | - |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:5173 |

## Testing with Sample Data

To test the API, you can:

1. Register a student (ID ending in 0, e.g., "1230")
2. Register a faculty (ID not ending in 0, e.g., "1001")
3. Login with either account
4. Use the returned JWT token for subsequent requests

Example registration:
```json
POST /api/auth/register
{
  "fullName": "John Doe",
  "email": "john.doe@somaiya.edu",
  "studentId": "1230",
  "password": "password123"
}
```

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

All responses follow this format:
```json
{
  "success": true/false,
  "message": "Description",
  "data": {} // Only on success
}
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## Security Notes

- Always use HTTPS in production
- Change the JWT_SECRET to a strong random value
- Never commit `.env` file to version control
- Validate and sanitize all user inputs
- Keep dependencies updated

## License

ISC
