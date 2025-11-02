# Setup Instructions for Real-time MERN LMS Features

## ✅ Backend Setup (COMPLETE)

### 1. Install Dependencies
```bash
cd backend
npm install socket.io  # Already installed
```

### 2. Environment Variables
Create/update `.env` file in `backend/`:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=AIzaSyAy5fkupI-8Wal6OC1TMDcjuLhCZAw0qWA
```

### 3. Start Backend Server
```bash
cd backend
npm run dev
```

The server should start with Socket.io enabled. You should see:
```
🔌 Socket.io enabled for real-time updates
```

## ✅ Frontend Setup (COMPLETE)

### 1. Install Dependencies
```bash
cd frontend
npm install socket.io-client  # Already installed
```

### 2. Environment Variables (Optional)
Create/update `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

## 🧪 Testing the Features

### Test 1: Assignment Grading with Real-time Update

1. **As Faculty:**
   - Go to Assignments page
   - Click on an assignment → View Submissions
   - Open a student submission
   - Run plagiarism check (mock)
   - Click "Grade" button
   - Enter marks, feedback, and optionally include plagiarism report
   - Click "Send Grade & Report"

2. **As Student:**
   - Open Assignments page in another tab/browser
   - The submission should automatically update with:
     - Grade/Score
     - Feedback
     - Plagiarism Report (if sent)
     - "View Full Report" button (if URL provided)
   - No page refresh needed!

### Test 2: Code Submission with AI Feedback

1. **As Student:**
   - Go to Coding Zone
   - Write some code (e.g., Python)
   - Click "Run Code" to test
   - Click "Submit & Get Feedback"
   - Wait for AI feedback (Gemini API call happens on backend)
   - Submission appears in "Code Submissions" section below

2. **As Faculty:**
   - Open Code Submissions page
   - The new submission should appear automatically
   - Click "Preview" to see:
     - Full code
     - Output (if any)
     - AI feedback from Gemini
     - Score

## 📡 Socket.io Events

### Student Events:
- **Join Room:** `join-student-room` (with studentId)
- **Listen:** `assignment-graded` (receives grade updates)

### Faculty Events:
- **Join Room:** `join-code-submissions-room`
- **Listen:** `new-code-submission` (receives new code submissions)

## 🔍 Debugging

### Check Socket.io Connection:
1. Open browser console (F12)
2. Look for: `✅ Socket.io connected: [socket-id]`

### Check API Calls:
1. Open Network tab (F12)
2. Filter by "Fetch/XHR"
3. Verify API calls are made to backend

### Common Issues:

1. **Socket.io not connecting:**
   - Check CORS settings in `backend/server.js`
   - Verify backend is running
   - Check browser console for errors

2. **API requests failing:**
   - Verify backend is running on port 5000
   - Check authentication token in localStorage
   - Verify API URL in `frontend/src/utils/api.js`

3. **Real-time updates not working:**
   - Check if Socket.io connection is established
   - Verify room join events are emitted
   - Check backend console for event emissions

## 📝 Notes

- All data is now persisted in MongoDB
- Socket.io provides real-time updates without polling
- AI feedback is generated server-side using Gemini API
- Plagiarism reports are stored with assignment grades
- Both faculty and student dashboards update in real-time

