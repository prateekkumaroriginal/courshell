import { useEffect, useState } from 'react';
import './App.css'

function App() {
    const [file, setFile] = useState();
    const [isLoading, setIsLoaading] = useState(true);

    const fetchData = async () => {
        const response = await fetch(`http://localhost:3000/instructor/courses/152a99db-b604-44ee-bf0b-7bda2b287a99/attachments/f8652041-46fe-4a5a-b2ad-bd3cc67abc94`, {
            headers: {
                authorization: 'Bearer ' + localStorage.getItem('token')
            }
        });
        const data = await response.json();
        console.log(data);
        setFile(data.attachment);
        setIsLoaading(false);
    }

    {/* Browser's pdf viewer */}
    const getDataUrl = (base64String) => `data:application/pdf;base64, ${base64String}`;
    const handleClick = (dataUrl) => {
        const newWindow = window.open();
        newWindow.document.write(`<iframe src="${dataUrl}" width="100%" height="100%" frameborder="0"></iframe>`);
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            {!isLoading &&
                <img className='h-40 w-40' src={`data:image/jpeg;base64, ${file}`} alt="" />
            }

        </div>
    )
}

export default App
