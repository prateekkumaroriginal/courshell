import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import Signin from './components/Signin'
import Signup from './components/Signup'
import Courses from './components/Courses'
import Create from './components/Create'
import Course from './components/Course'

function App() {

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path='/dashboard' element={<Dashboard/>} />
                <Route path='/browse' element={<Dashboard/>} />
                <Route path='/signin' element={<Signin/>} />
                <Route path='/signup' element={<Signup/>} />
                <Route path='/courses' element={<Courses/>} />
                <Route path='/courses/:courseId' element={<Course/>} />
                <Route path='/create' element={<Create/>} />
            </Routes>
        </Router>
    )
}

export default App
