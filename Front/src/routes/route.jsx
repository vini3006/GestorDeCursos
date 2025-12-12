import React from "react"
import { Route, Routes, BrowserRouter } from "react-router-dom"
import Login from "../pages/login/login"
import AdminDashboard from "../pages/adminDashboard/adminDashboard"
import ManageUsers from "../pages/adminDashboard/manageUsers/manageUsers"
import ManageSemesters from "../pages/adminDashboard/manageSemesters/manageSemesters"
import UserProfile from "../pages/UserProfile/UserProfile"
import ManageEducation from "../pages/adminDashboard/manageEducation/manageEducation"
import ManageCourses from "../pages/adminDashboard/manageEducation/manageCourses/manageCourses"
import ManageSubjects from "../pages/adminDashboard/manageEducation/manageSubjects/manageSubjects"
import ManageClasses from "../pages/adminDashboard/manageEducation/manageClasses/manageClasses"
import ProfessorDashboard from "../pages/professorDashboard/professorDashboard"
import EvaluateStudentsPage from "../pages/professorDashboard/evaluateStudents/evaluateStudents"

const Rotas = () => {
    return (
        <React.StrictMode>
            <BrowserRouter>
                <Routes>
                 <Route 
                     path="/"
                     element={<Login/>}
                 />

                 <Route 
                     path="/admin/dashboard"
                     element={<AdminDashboard/>}
                 />

                 <Route 
                     path="/admin/users"
                     element={<ManageUsers/>}
                 />

                <Route 
                    path="/admin/semesters" 
                    element={<ManageSemesters/>}
                />

                <Route
                    path="/userprofile"
                    element={<UserProfile />}
                />

                <Route
                    path="/admin/education"
                    element={<ManageEducation />}
                />

                <Route
                    path="/admin/education/courses"
                    element={<ManageCourses />}
                />

                <Route
                    path="/admin/education/subjects"
                    element={<ManageSubjects/>}
                />

                <Route
                    path="/admin/education/classes"
                    element={<ManageClasses/>}
                />

                <Route
                    path="/professor/dashboard"
                    element={<ProfessorDashboard/>}
                />

                <Route
                    path="/professor/turma/:idTurma/avaliar-alunos"
                    element={<EvaluateStudentsPage/>}
                />
                </Routes>        
            </BrowserRouter>
        </React.StrictMode>
    )
}   

export default Rotas;