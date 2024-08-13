import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import './App.css'
import Create from '@/components/Instructor/Create';
import Course from '@/components/Instructor/Course';
import Signin from '@/components/common/Signin';
import Navbar from '@/components/common/Navbar';
import Module from '@/components/Instructor/Module';
import Article from '@/components/Instructor/Article';
import Attachment from '@/components/common/Attachment';
import CreatedCourses from '@/components/Instructor/CreatedCourses';
import BrowsePage from '@/components/User/BrowsePage';
import ReadCourse from '@/components/User/ReadCourse';
import Dashboard from '@/components/User/Dashboard';
import Analytics from '@/components/Instructor/Analytics';
import ManageCourses from './components/Admin/ManageCourses';
import ManageCourse from './components/Admin/ManageCourse';
import Users from './components/Superadmin/Users';
import ToastProvider from './components/ui/ToastProvider';
import AddUser from './components/Superadmin/AddUser';
import RedirectComponent from './components/common/RedirectComponent';

const hideNavbarPaths = [
    '/courses/:courseId/attachments/:attachmentId',
    '/instructor/courses/:courseId/attachments/:attachmentId',
];
const shouldHideNavbar = (pathname, hidingPaths) => {
    return hidingPaths.some(path => {
        const regex = new RegExp(`^${path.replace(/:\w+/g, '[^/]+')}$`);
        return regex.test(pathname);
    });
};

function AppRoutes() {
    const location = useLocation();
    const [userRole, setUserRole] = useState();

    useEffect(() => {
        document.title = 'Courshell';
    }, []);

    return (
        <>
            <ToastProvider />
            {!shouldHideNavbar(location.pathname, hideNavbarPaths) && <Navbar userRole={userRole} setUserRole={setUserRole} />}
            <Routes>
                <Route path='/' element={<RedirectComponent />} />
                <Route path='/signin' element={<Signin setUserRole={setUserRole} />} />
                <Route path='/browse' element={<BrowsePage />} />
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/courses/:courseId' element={<ReadCourse />} />
                <Route path='/courses/:courseId/:moduleId/:articleId' element={<ReadCourse />} />
                <Route path='/courses/:courseId/attachments/:attachmentId' element={<Attachment />} />
                <Route path='/instructor/analytics' element={<Analytics />} />
                <Route path='/instructor/create' element={<Create />} />
                <Route path='/instructor/courses' element={<CreatedCourses />} />
                <Route path='/instructor/courses/:courseId' element={<Course />} />
                <Route path='/instructor/courses/:courseId/attachments/:attachmentId' element={<Attachment />} />
                <Route path='/instructor/courses/:courseId/:moduleId' element={<Module />} />
                <Route path='/instructor/courses/:courseId/:moduleId/:articleId' element={<Article />} />
                <Route path='/admin/courses' element={<ManageCourses />} />
                <Route path='/admin/courses/:courseId' element={<ManageCourse />} />
                <Route path='/superadmin/users' element={<Users />} />
                <Route path='/superadmin/users/add' element={<AddUser />} />
            </Routes>
        </>
    )
}

function App() {
    return (
        <Router>
            <AppRoutes />
        </Router>
    )
}

export default App
