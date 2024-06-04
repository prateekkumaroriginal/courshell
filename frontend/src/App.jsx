import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css'
import Create from '@/components/Instructor/Create';
import Course from '@/components/Instructor/Course';
import Signin from '@/components/common/Signin';
import Navbar from '@/components/common/Navbar';
import Module from '@/components/Instructor/Module';
import Article from '@/components/Instructor/Article';
import Attachment from '@/components/common/Attachment';
import Courses from '@/components/Instructor/Courses';
import SearchPage from '@/components/User/SearchPage';
import ReadCourse from '@/components/User/ReadCourse';

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
    const isInstructorPage = location.pathname.startsWith('/instructor');

    return (
        <>
            {!shouldHideNavbar(location.pathname, hideNavbarPaths) && <Navbar />}
            <Routes>
                <Route path='/signin' element={<Signin />} />
                <Route path='/search' element={<SearchPage />} />
                <Route path='/courses/:courseId' element={<ReadCourse />} />
                <Route path='/courses/:courseId/:articleId' element={<ReadCourse />} />
                <Route path='/instructor/create' element={<Create />} />
                <Route path='/instructor/courses' element={<Courses />} />
                <Route path='/instructor/courses/:courseId' element={<Course />} />
                <Route path='/instructor/courses/:courseId/attachments/:attachmentId' element={<Attachment />} />
                <Route path='/instructor/courses/:courseId/:moduleId' element={<Module />} />
                <Route path='/instructor/courses/:courseId/:moduleId/:articleId' element={<Article />} />
                {/* <Route path='/dashboard' element={<Dashboard />} />
                */}
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
