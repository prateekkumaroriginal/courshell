import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import CoursePreview from '@/components/User/CoursePreview';
import Dashboard from '@/components/User/Dashboard';
import Analytics from '@/components/Instructor/Analytics';
import ManageCourses from './components/Admin/ManageCourses';
import ManageCourse from './components/Admin/ManageCourse';
import Users from './components/Superadmin/Users';
import ToastProvider from './components/ui/ToastProvider';
import Signup from './components/common/Signup';
import RedirectComponent from './components/common/RedirectComponent';
import ReadArticle from './components/User/ReadArticle';
import PrivacyPolicy from './components/common/PrivacyPolicy';
import Terms from './components/common/Terms';
import Refunds from './components/common/Refunds';
import ContactUs from './components/common/ContactUs';
import Shipping from './components/common/Shipping';
import NotFound from './components/common/NotFound';

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
                <Route path='/privacy-policy' element={<PrivacyPolicy />} />
                <Route path='/terms' element={<Terms />} />
                <Route path='/refunds' element={<Refunds />} />
                <Route path='/contact-us' element={<ContactUs />} />
                <Route path='/shipping' element={<Shipping />} />
                <Route path='/signup' element={<Signup setUserRole={setUserRole} />} />
                <Route path='/signin' element={<Signin setUserRole={setUserRole} />} />
                <Route path='/browse' element={<BrowsePage />} />
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/courses/:courseId' element={<CoursePreview userRole={userRole} />} />
                <Route path='/courses/:courseId/:moduleId/:articleId' element={<ReadArticle />} />
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
                <Route path='*' element={<NotFound />} />
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
