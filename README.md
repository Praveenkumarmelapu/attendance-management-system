# 🎓 AttendEase — MERN Stack Attendance Management System

A complete, production-ready **MERN Stack** Attendance Management System built as a college learning project.

---

## 🚀 Live Demo Screenshots

The app is fully working with all 3 user roles:
- ✅ **Admin Dashboard** — 6 students, 2 teachers, 2 classes shown
- ✅ **Teacher Dashboard** — Dr. Rajesh Kumar's class + Mark Attendance button
- ✅ **Student Dashboard** — Arjun Singh's attendance stats

---

## 📁 Project Structure

```
attendance-management-system/
│
├── client/                    ← React Frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── AttendanceTable.jsx
│       │   ├── StudentCard.jsx
│       │   └── Loading.jsx
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── admin/
│       │   │   ├── AdminDashboard.jsx
│       │   │   ├── Students.jsx
│       │   │   ├── Teachers.jsx
│       │   │   ├── Classes.jsx
│       │   │   └── AttendanceReports.jsx
│       │   ├── teacher/
│       │   │   ├── TeacherDashboard.jsx
│       │   │   ├── MarkAttendance.jsx
│       │   │   └── AttendanceHistory.jsx
│       │   └── student/
│       │       ├── StudentDashboard.jsx
│       │       ├── MyAttendance.jsx
│       │       └── Profile.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── services/
│       │   └── api.js
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
└── server/                    ← Express Backend (Node.js)
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── User.js
    │   ├── Student.js
    │   ├── Teacher.js
    │   ├── Class.js
    │   └── Attendance.js
    ├── controllers/
    │   ├── authController.js
    │   ├── studentController.js
    │   ├── teacherController.js
    │   ├── classController.js
    │   └── attendanceController.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── studentRoutes.js
    │   ├── teacherRoutes.js
    │   ├── classRoutes.js
    │   └── attendanceRoutes.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── roleMiddleware.js
    ├── seed.js
    ├── server.js
    ├── .env
    └── package.json
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally)
- MongoDB Compass (optional, for GUI)

### Step 1 — Clone/Open the project
```bash
cd attendance-management-system
```

### Step 2 — Setup Backend
```bash
cd server
npm install
```

Check the `.env` file:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/attendance_system
JWT_SECRET=attendance_secret_key_2024_mern_project
```

### Step 3 — Seed the Database (Demo Data)
```bash
node seed.js
```

This creates:
- 1 Admin
- 2 Teachers + their Classes
- 6 Students
- 10 days of sample attendance records

### Step 4 — Start the Backend
```bash
npm run dev
```
Backend runs at: http://localhost:5000

### Step 5 — Setup Frontend
```bash
cd ../client
npm install --legacy-peer-deps --prefer-offline
npm run dev
```
Frontend runs at: http://localhost:5173

---

## 🔑 Login Credentials

| Role    | Email                  | Password     |
|---------|------------------------|--------------|
| Admin   | admin@school.com       | admin123     |
| Teacher | teacher@school.com     | teacher123   |
| Student | student@school.com     | student123   |

---

## 🎯 Features by Role

### 🛡️ Admin
- View dashboard with statistics
- Add/Edit/Delete Students
- Add/Edit/Delete Teachers
- Create/Manage Classes
- Assign Teachers to Classes
- View all attendance records
- Filter attendance by class, date, status
- Delete attendance records

### 👨‍🏫 Teacher
- View assigned classes
- Mark attendance for all students
- Bulk mark: All Present / All Absent / All Late
- Edit previous attendance
- Filter attendance history by class, date, status

### 🎒 Student
- View personal attendance statistics
- See attendance percentage with progress bar
- View full attendance history
- Filter attendance by date range
- View personal profile

---

## 🔧 API Endpoints

### Auth
```
POST /api/auth/register     — Create account
POST /api/auth/login        — Login (returns JWT)
GET  /api/auth/me           — Get current user
```

### Students
```
GET    /api/students        — List all (search/filter supported)
GET    /api/students/:id    — Get one
POST   /api/students        — Create (Admin only)
PUT    /api/students/:id    — Update (Admin only)
DELETE /api/students/:id    — Delete (Admin only)
```

### Teachers
```
GET    /api/teachers
GET    /api/teachers/:id
POST   /api/teachers
PUT    /api/teachers/:id
DELETE /api/teachers/:id
```

### Classes
```
GET    /api/classes
GET    /api/classes/:id
GET    /api/classes/teacher/:teacherId
POST   /api/classes
PUT    /api/classes/:id
DELETE /api/classes/:id
POST   /api/classes/:id/students
```

### Attendance
```
POST   /api/attendance                       — Mark attendance (bulk)
GET    /api/attendance                       — Get all (with filters)
GET    /api/attendance/stats/overview        — Dashboard stats
GET    /api/attendance/student/:studentId    — Student's records
GET    /api/attendance/class/:classId        — Class records
PUT    /api/attendance/:id                   — Edit record
DELETE /api/attendance/:id                   — Delete record
```

---

## 🧠 How It Works (MERN Flow)

```
React Frontend (port 5173)
        ↓ HTTP requests (Axios)
Express REST API (port 5000)
        ↓ JWT auth middleware
Controllers (business logic)
        ↓ Mongoose queries
MongoDB (attendance_system DB)
```

### Authentication Flow
1. User submits login form → POST /api/auth/login
2. Server checks email+password → Returns JWT token
3. React stores token in localStorage
4. Every request sends token in header: `Authorization: Bearer <token>`
5. authMiddleware verifies token → attaches user to `req.user`
6. roleMiddleware checks if user's role matches the route requirement

### Attendance Percentage Formula
```
Attendance % = (Present Days / Total Classes) × 100
```

---

## 📦 Packages Used

### Backend
| Package       | Purpose                              |
|---------------|--------------------------------------|
| express       | Web framework for Node.js            |
| mongoose      | MongoDB ODM — models and queries     |
| jsonwebtoken  | Create and verify JWT tokens         |
| bcryptjs      | Hash passwords before saving         |
| cors          | Allow frontend to call backend API   |
| dotenv        | Load .env environment variables      |
| nodemon       | Auto-restart server on file changes  |

### Frontend
| Package          | Purpose                              |
|------------------|--------------------------------------|
| react            | UI library                           |
| react-dom        | Renders React to the browser         |
| react-router-dom | Client-side routing between pages    |
| axios            | Make HTTP requests to the backend    |
| vite             | Fast development build tool          |

---

## 🔍 Common Issues & Fixes

### MongoDB not connecting
- Make sure MongoDB is running: `mongod` or start MongoDB service
- Check MONGO_URI in .env matches your MongoDB port

### "Cannot find module" error
- Run `npm install` in both `/server` and `/client` folders

### Port already in use
- Change PORT in `.env` (backend) or add `--port 3000` to vite (frontend)

### Student attendance showing 0%
- The student's attendance percentage depends on seeded data
- Run `node seed.js` again to regenerate data

---

## 🎓 Learning Outcomes

After completing this project, you understand:

1. **React** — Components, Props, State, Hooks (useState, useEffect, useContext)
2. **React Router** — Client-side navigation, protected routes
3. **Axios** — Making API calls, request/response interceptors
4. **Context API** — Global state management for authentication
5. **Node.js** — JavaScript on the server side
6. **Express.js** — REST API creation, middleware, routing
7. **MongoDB** — NoSQL database, documents, collections
8. **Mongoose** — Schemas, models, CRUD operations, relationships
9. **JWT** — Stateless authentication tokens
10. **bcrypt** — Secure password hashing
11. **CORS** — Cross-origin resource sharing
12. **Role-based access control** — Admin/Teacher/Student permissions
