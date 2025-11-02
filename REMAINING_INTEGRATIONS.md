# Remaining Integration Tasks

## ✅ Completed
- Phase 0: UI Bug Fixes (calendar, dialog, select)
- Phase 1: Authentication Flow
- Phase 2: Student Settings Page (Profile, Avatar, Password)
- Phase 2: Student Feedback Page (Load, Submit, Delete)
- Phase 2: Student Assignments Page (already done)
- Phase 3: CodingZonePage - Removed API keys from frontend

## 🔄 Remaining Tasks

### Phase 2: Student Portal (Continued)

#### Student Courses Page (`frontend/src/pages/student/CoursesPage.jsx`)
- [ ] Replace `getLocalData('courses')` with `studentAPI.getCourses()`
- [ ] Load enrolled courses from backend
- [ ] Update enrollment logic to use backend API

#### Student Grades Page (`frontend/src/pages/student/GradesPage.jsx`)
- [ ] Replace `getLocalData('grades')` with `studentAPI.getGrades()`
- [ ] Load grades from backend API

#### Student Calendar Page (`frontend/src/pages/student/CalendarPage.jsx`)
- [ ] Replace `getLocalData` with `studentAPI.getCalendar()`
- [ ] Load calendar events from backend

### Phase 3: AI & API Proxy (Continued)

#### CodingZonePage (`frontend/src/pages/student/CodingZonePage.jsx`)
- [ ] Update `handleRunCode` to use `studentAPI.executeCode()` instead of direct Piston API call
- [ ] The `handleSubmitCode` already uses backend (codeSubmissionController.js), but verify it doesn't call frontend AI functions

#### AIQuizPage (`frontend/src/pages/faculty/AIQuizPage.jsx`)
- [ ] Remove direct Gemini API calls
- [ ] Update `handleSubmit` to use `facultyAPI.generateQuiz()`

### Phase 4: Faculty Portal

#### Faculty Courses Page (`frontend/src/pages/faculty/CoursesPage.jsx`)
- [ ] Load courses: `useEffect` + `facultyAPI.getCourses()`
- [ ] Create course: `handleSubmit` → `facultyAPI.createCourse()`
- [ ] Update course: `handleEdit` → `facultyAPI.updateCourse()`
- [ ] Delete course: `handleDelete` → `facultyAPI.deleteCourse()`
- [ ] Wire delete alert dialog (already has state `courseToDelete`)

#### Faculty Timetable Page (`frontend/src/pages/faculty/TimetablePage.jsx`)
- [ ] Load timetable: `useEffect` + `facultyAPI.getTimetable()`
- [ ] Create entry: `handleSubmit` → `facultyAPI.createTimetableEntry()`
- [ ] Delete entry: `handleDelete` → `facultyAPI.deleteTimetableEntry()`
- [ ] Wire delete alert dialog (already has state `slotToDelete`)

#### Faculty Assignments Page (`frontend/src/pages/faculty/AssignmentsPage.jsx`)
- [ ] Load assignments: `useEffect` + `facultyAPI.getAssignments()`
- [ ] Create assignment: `handleCreateAssignment` → `facultyAPI.createAssignment()`
- [ ] View submissions: `handleViewSubmissions` → `facultyAPI.getSubmissions(assignmentId)`
- [ ] Grade submission: Already using `facultyAPI.gradeSubmission()` ✅

### Phase 6: Cleanup

#### Remove Mock Data
- [ ] Delete `frontend/src/utils/mockData.js`
- [ ] Remove `initializeMockData()` call from `frontend/src/App.jsx`

#### Clean Storage Utils
- [ ] In `frontend/src/utils/storage.js`, remove:
  - `getLocalData` (except if still needed for courses/announcements temporarily)
  - `setLocalData` (except if still needed temporarily)
- [ ] Keep only:
  - `getUser()`
  - `setUser()`
  - `removeUser()`

## 🔍 Backend Endpoints to Verify

Verify these backend endpoints exist and work correctly:
- ✅ `/api/auth/login` - Working
- ✅ `/api/auth/me` - Working
- ✅ `/api/users/profile` - Working
- ✅ `/api/users/avatar` - Working
- ✅ `/api/users/password` - Working
- ✅ `/api/student/assignments` - Working
- ✅ `/api/student/code-submissions` - Working
- ✅ `/api/faculty/code-submissions` - Working
- [ ] `/api/student/feedback` - Verify exists
- [ ] `/api/student/courses` - Verify exists
- [ ] `/api/student/grades` - Verify exists
- [ ] `/api/student/calendar` - Verify exists
- [ ] `/api/faculty/courses` - Verify exists
- [ ] `/api/faculty/timetable` - Verify exists
- [ ] `/api/faculty/assignments` - Verify exists
- [ ] `/api/faculty/assignments/:id/submissions` - Verify exists
- [ ] `/api/proxy/piston/execute` - Verify exists
- [ ] `/api/proxy/ai/generate-quiz` - Verify exists

## 📝 Notes

1. **Authentication**: All API calls automatically include the JWT token via `getToken()` in `api.js`
2. **Error Handling**: All API functions throw errors that are caught and displayed via toast notifications
3. **Loading States**: Consider adding loading states to pages that fetch data
4. **Real-time Updates**: Socket.io is already set up for assignments and code submissions
5. **File Uploads**: Some features (feedback attachments, assignment files) may need backend file upload handling

