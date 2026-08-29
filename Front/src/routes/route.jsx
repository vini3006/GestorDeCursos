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
import RegisterResource from "../pages/professorDashboard/registerResources/registerResources"
import ViewSubmissions from "../pages/professorDashboard/viewSubmissions/viewSubmissions"
import StudentDashboard from "../pages/studentDashboard/studentDashboard"
import ViewActiveClasses from "../pages/studentDashboard/viewActiveClasses/viewActiveClasses"
import ViewMaterials from "../pages/studentDashboard/viewActiveClasses/viewMaterials/viewMaterials"
import ViewActivities from "../pages/studentDashboard/viewActiveClasses/viewActivities/viewActivities"
import ManageEnrollments from "../pages/studentDashboard/manageEnrollments/manageEnrollments"
import ViewAcademicRecord from "../pages/studentDashboard/viewAcademicRecord/viewAcademicRecord"

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

                <Route
                    path="/professor/turma/:idTurma/cadastrar-recursos"
                    element={<RegisterResource/>}
                />

                <Route
                    path="/professor/turma/:idTurma/ver-entregas"
                    element={<ViewSubmissions />}
                />

                <Route
                    path="/student/dashboard"
                    element={<StudentDashboard />}
                />

                <Route
                    path="/student/active-classes"
                    element={<ViewActiveClasses />}
                />

                <Route
                    path="/student/classes/:idTurma/materials"
                    element={<ViewMaterials />}
                />

                <Route
                    path="/student/classes/:idTurma/activities"
                    element={<ViewActivities />}
                />

                <Route
                    path="/student/enroll"
                    element={<ManageEnrollments />}
                />

                <Route
                    path="/student/academic-record"
                    element={<ViewAcademicRecord />}
                />
                </Routes>        
            </BrowserRouter>
        </React.StrictMode>
    )
}   


export default Rotas;