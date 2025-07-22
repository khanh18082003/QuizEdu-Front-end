import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/shared/Layout";
import AuthenticationLayout from "./components/shared/AuthenticationLayout";
import StudentLayout from "./components/shared/StudentLayout";
import TeacherLayout from "./components/shared/TeacherLayout";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import Login from "./pages/auth/Login";
import RegisterOptions from "./pages/auth/RegisterOptions";
import StudentRegister from "./pages/auth/StudentRegister";
import TeacherRegister from "./pages/auth/TeacherRegister";
import Verification from "./pages/auth/Verification";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import StudentHome from "./pages/student/StudentHome";
import TeacherHome from "./pages/teacher/TeacherHome";
import Class from "./pages/teacher/Class";
import ClassDetail from "./pages/teacher/ClassDetail";
import { Oauth2Authentication } from "./pages/auth/Oauth2Authentication";
import { StudentProfile } from "./pages/student/StudentProfile";
import { TeacherProfile } from "./pages/teacher/TeacherProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Auth Routes with Authentication Layout */}
        <Route path="/authentication" element={<AuthenticationLayout />}>
          <Route path="oauth2" element={<Oauth2Authentication />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<RegisterOptions />} />
          <Route path="register/student" element={<StudentRegister />} />
          <Route path="register/teacher" element={<TeacherRegister />} />
          <Route path="verification" element={<Verification />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* Student Dashboard Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route path="dashboard" element={<StudentHome />} />
          {/* Add more student routes as needed */}
          <Route path="courses" element={<div>Student Courses</div>} />
          <Route path="exams" element={<div>Student Exams</div>} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="settings" element={<div>Student Settings</div>} />
        </Route>

        {/* Teacher Dashboard Routes */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route path="dashboard" element={<TeacherHome />} />
          {/* Add more teacher routes as needed */}
          <Route path="classes" element={<Class/>} />
          <Route path="classes/:classId" element={<ClassDetail/>} />
          <Route path="exams" element={<div>Teacher Exams</div>} />
          <Route path="profile" element={<div>Teacher Profile</div>} />

          <Route path="settings" element={<div>Teacher Settings</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
