import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css'
import Create from '@/components/Create';
import Course from '@/components/Course';
import Signin from '@/components/Signin';
import Navbar from '@/components/Navbar';
import Module from '@/components/Module';
import Article from '@/components/Article';
import Attachment from '@/components/Attachment';
import Courses from '@/components/Courses';
import SearchPage from '@/components/SearchPage';

const hideNavbarPaths = ['/courses/:courseId/attachments/:attachmentId'];
const shouldHideNavbar = (pathname, hidingPaths) => {
    return hidingPaths.some(path => {
        const regex = new RegExp(`^${path.replace(/:\w+/g, '[^/]+')}$`);
        return regex.test(pathname);
    });
};

function AppRoutes() {
    const location = useLocation();

    return (
        <>
            {!shouldHideNavbar(location.pathname, hideNavbarPaths) && <Navbar />}
            <Routes>
                <Route path='/signin' element={<Signin />} />
                <Route path='/search' element={<SearchPage />} />
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
