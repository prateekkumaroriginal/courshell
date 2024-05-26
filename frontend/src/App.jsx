import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css'
import Create from '@/components/Create';
import Course from '@/components/Course';
import Signin from '@/components/Signin';
import Navbar from '@/components/Navbar';
import Module from '@/components/Module';
import Article from '@/components/Article';
import Attachment from '@/components/Attachment';

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
                <Route path='/create' element={<Create />} />
                <Route path='/courses/:courseId' element={<Course />} />
                <Route path='/courses/:courseId/attachments/:attachmentId' element={<Attachment />} />
                <Route path='/courses/:courseId/:moduleId' element={<Module />} />
                <Route path='/courses/:courseId/:moduleId/:articleId' element={<Article />} />
                {/* <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/courses' element={<Courses />} />
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
