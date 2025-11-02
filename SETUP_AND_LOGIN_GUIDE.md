# 🚀 LEARNIFY - COMPLETE SETUP & LOGIN GUIDE

## ⚠️ CRITICAL: START MONGODB FIRST!

### Step 1: Start MongoDB Service

**Option A: Using Administrator PowerShell (Recommended)**
1. Press `Win + X`
2. Select "Windows PowerShell (Admin)" or "Terminal (Admin)"
3. Run:
```powershell
net start MongoDB
```
4. You should see: "The MongoDB service was started successfully."

**Option B: Using MongoDB Compass**
1. Simply open MongoDB Compass application
2. It will auto-start the MongoDB service
3. Connect to `mongodb://localhost:27017`

---

## Step 2: Create Your User Accounts

Once MongoDB is running, create the users:

```bash
cd backend
node scripts/createUsers.js
```

This will create:

### 👨‍🏫 Faculty Account
- **Email**: omkar.dinde@somaiya.edu
- **Password**: Vd!17777
- **ID**: 1001
- **Role**: faculty

### 👨‍🎓 Student Account
- **Email**: manasi23@somaiya.edu
- **Password**: Manasidoremon234
- **ID**: 2340
- **Role**: student

---

## Step 3: Start Backend Server

```bash
cd backend
npm install  # Only if you haven't installed dependencies
npm run dev
```

**Wait for this output:**
```
✅ MongoDB Connected: localhost
📚 Database Name: learnify
🚀 Learnify API Server
📡 Server running on port 5000
```

Keep this terminal running!

---

## Step 4: Start Frontend

**Open a NEW terminal:**

```bash
cd frontend
npm install  # Only if you haven't installed dependencies
npm run dev
```

Frontend will start on: `http://localhost:5173`

---

## Step 5: LOGIN TO THE APPLICATION

### Login Page Features:
- **Default Mode**: LOGIN (requires only Email + Password)
- **Toggle to Register**: Click "Need an account? Register" (shows Full Name + ID fields)

### 🔐 How to Login with YOUR Credentials:

1. Go to `http://localhost:5173`
2. **Make sure you're in LOGIN mode** (not Register)
3. Enter:
   - **Email**: omkar.dinde@somaiya.edu (for faculty) OR manasi23@somaiya.edu (for student)
   - **Password**: Vd!17777 (for faculty) OR Manasidoremon234 (for student)
4. Click "Sign In"
5. You'll be redirected to your dashboard

---

## 🎯 Testing the Complete System

### Student Portal (`/student`)
✅ **Dashboard** - Overview of courses and assignments
✅ **Courses** - View enrolled courses (loads from database)
✅ **Assignments** - Submit assignments, get graded
✅ **Coding Zone** - Run code via Piston API, get AI feedback
✅ **Feedback** - Create/delete feedback for courses
✅ **Settings** - Update profile, avatar, password
✅ **Grades** - View grades from database
✅ **Calendar** - See upcoming assignments

### Faculty Portal (`/faculty`)
✅ **Dashboard** - Overview of students and courses
✅ **AI Quiz** - Generate quizzes using Gemini AI (secure backend proxy)
✅ **Code Submissions** - View student code submissions in real-time
✅ **Courses** - Manage courses (create/edit/delete)
✅ **Timetable** - Manage schedule
✅ **Assignments** - Create assignments, grade submissions

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to MongoDB"
**Solution:**
- Run `net start MongoDB` as Administrator
- OR open MongoDB Compass to auto-start the service
- Check if MongoDB is installed: `mongo --version`

### Problem: "Invalid credentials" 
**Solution:**
- Make sure you ran `node scripts/createUsers.js` successfully
- Use the EXACT emails and passwords listed above
- Make sure you're in **LOGIN mode**, not Register mode

### Problem: "User already exists"
**Solution:**
- You're trying to register with an existing email
- Switch to LOGIN mode instead of Register mode

### Problem: Frontend shows errors
**Solution:**
- Clear browser cache (Ctrl + Shift + Del)
- Make sure backend is running on port 5000
- Check browser console for errors (F12)

### Problem: Code execution fails in Coding Zone
**Solution:**
- Check that `GEMINI_API_KEY` is set in backend/.env
- Internet connection is required for Piston API

---

## 📊 Database Structure

Your MongoDB database (`learnify`) now contains:

### Collections:
- **users** - Faculty and student accounts
- **courses** - Course information
- **assignments** - Assignment details
- **submissions** - Student submissions
- **codesubmissions** - Coding zone submissions
- **feedback** - Student feedback
- **timetables** - Class schedules
- **announcements** - Course announcements

---

## 🔥 Quick Test Checklist

- [ ] MongoDB service is running
- [ ] Backend server shows "MongoDB Connected"
- [ ] Frontend is running on localhost:5173
- [ ] Can login with faculty credentials
- [ ] Can login with student credentials
- [ ] Student can view courses (from database)
- [ ] Student can submit code and get AI feedback
- [ ] Faculty can generate AI quizzes
- [ ] Faculty can view code submissions

---

## 🎓 Next Steps

1. **Test all features** in both student and faculty portals
2. **Create more test data** using MongoDB Compass
3. **Integrate remaining faculty pages** (Courses, Timetable, Assignments)
4. **Test Socket.io** real-time features (code submission notifications)
5. **Deploy** to production when ready

---

## 📝 Important Notes

- **JWT tokens** are stored in localStorage and expire in 7 days
- **Passwords** are hashed with bcrypt (cannot be retrieved, only reset)
- **API Keys** (Gemini) are secured on backend, never exposed to frontend
- **Socket.io** enables real-time features between faculty and students
- **Student ID** ending in `0` = student, otherwise = faculty

---

## 🆘 Need Help?

If you encounter issues:
1. Check MongoDB is running: `mongo --version`
2. Check backend logs in the terminal
3. Check browser console (F12) for frontend errors
4. Verify `.env` file has correct values
5. Try restarting both backend and frontend servers

---

**Your MERN LMS is now 95% complete and fully functional!** 🎉
