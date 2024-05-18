import { useEffect, useState } from 'react';
import './App.css'

function App() {
    const [image, setImage] = useState();
    const [isLoading, setIsLoaading] = useState(true);

    const fetchData = async () => {
        const response = await fetch(`http://localhost:3000/instructor/courses/2ed14db2-5966-4bf1-b8ff-49384477c79d/attachments`, {
            headers: {
                authorization: 'Bearer ' + localStorage.getItem('token')
            }
        });
        const data = await response.json();
        console.log(data);
        setImage(data.attachments[0].data);
        setIsLoaading(false);
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            {!isLoading &&
                <img className='h-40 w-40' src={`data:image/jpeg;base64, ${image}`} alt="" />
            }
        </div>
    )
}

export default App
