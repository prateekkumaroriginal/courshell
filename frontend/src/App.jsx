import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Create from '@/components/Create';
import Course from '@/components/Course';
import Signin from '@/components/Signin';
import Navbar from '@/components/Navbar';
import Module from '@/components/Module';
import Article from '@/components/Article';

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path='/signin' element={<Signin />} />
                <Route path='/create' element={<Create />} />
                <Route path='/courses/:courseId' element={<Course />} />
                <Route path='/courses/:courseId/:moduleId' element={<Module />} />
                <Route path='/courses/:courseId/:moduleId/:articleId' element={<Article />} />
                {/* <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/courses' element={<Courses />} />
                */}
            </Routes>
        </Router>
    )
}

export default App
