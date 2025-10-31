# Learnify - Learning Management System

A high-performance, responsive, and feature-rich dual-portal Learning Management System (LMS) built with React, Vite, and TailwindCSS.

## 🚀 Features

### Student Portal
- **Dashboard**: Personalized welcome page with quick actions and widgets
- **Courses**: View enrolled courses with announcements, assignments, grades, and plagiarism reports
- **Assignments**: Manage pending and submitted assignments with file upload
- **Coding Zone**: Integrated IDE with code execution and AI-powered feedback
- **Grades**: View GPA, average grades, and course-wise breakdowns
- **Calendar**: Interactive calendar with event highlighting and management
- **Feedback**: Submit and manage course feedback with ratings
- **Settings**: Profile management, notifications, security, and theme customization

### Faculty Portal
- **Dashboard**: Overview of courses, students, and teaching schedule
- **Courses**: Manage courses with create/delete functionality
- **Timetable**: View and manage weekly teaching schedule
- **Students**: Manage enrolled students across courses
- **AI Quiz Creator**: Generate quizzes using AI
- **Settings**: Profile and account management

## 🎨 Design

- **Primary Color**: Yellow (#ffd700 - hsl(51, 100%, 50%))
- **Background**: Light mode - hsl(0, 0%, 98%), Dark mode - hsl(0, 0%, 10%)
- **UI Components**: shadcn/ui library for consistent design
- **Animations**: Framer Motion for smooth transitions
- **Responsive**: Mobile-first design approach

## 🛠️ Technology Stack

- **Framework**: React 18+
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **State Management**: React Context + TanStack Query
- **Notifications**: Sonner
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns, react-day-picker

## 📦 Installation

```bash
cd frontend
npm install
npm run dev
```

The application will run on `http://localhost:5173`

## 🔐 Login

### Student Login
- Email must end with `@somaiya.edu`
- ID must be exactly 4 digits ending with `0` (e.g., 1000, 2030)
- Password minimum 6 characters

Example:
- Name: John Doe
- Email: john.doe@somaiya.edu
- ID: 1000
- Password: password123

### Faculty Login
- Email must end with `@somaiya.edu`
- ID must be exactly 4 digits NOT ending with `0` (e.g., 1001, 2031)
- Password minimum 6 characters

Example:
- Name: Dr. Smith
- Email: dr.smith@somaiya.edu
- ID: 1001
- Password: password123

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── StudentSidebar.jsx
│   │   ├── FacultySidebar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── contexts/
│   │   └── ThemeContext.jsx
│   ├── pages/
│   │   ├── student/         # Student portal pages
│   │   ├── faculty/         # Faculty portal pages
│   │   └── Login.jsx
│   ├── utils/
│   │   ├── mockData.js
│   │   └── storage.js
│   ├── lib/
│   │   └── utils.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## ✨ Key Features Implementation

### Dynamic Data
- All data is stored in localStorage for persistence
- Mock data initializes on first load
- Fully dynamic calendar, assignments, and grading system

### Code Editor
- Multi-language support (C, C++, Java, Python)
- Simulated code execution
- AI-powered feedback system
- Score calculation

### Responsive Design
- Mobile-friendly navigation
- Adaptive layouts for different screen sizes
- Touch-optimized interactions

### Theme Support
- Light and Dark mode
- System preference detection
- Persistent theme selection

## 🚧 Development Notes

- The application uses a simulated backend via localStorage
- All API calls are mocked for demonstration
- Ready for backend integration

## 📝 License

This project is created for educational purposes.

## 👨‍💻 Author

Built with ❤️ for the Somaiya community
