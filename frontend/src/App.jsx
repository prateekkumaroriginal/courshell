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
            {/* {!isLoading &&
                <img className='h-40 w-40' src={`data:image/jpeg;base64, ${file}`} alt="" />
            } */}


            {/* {!isLoading && <div className='space-y-1 p-1 rounded-md bg-background'>
                <div className='flex items-center w-full bg-sky-200 rounded-md hover:bg-sky-300'>
                    <a className='w-full p-3 line-clamp-1' rel='noreferrer'>{file.name}</a>
                    <button
                        className='p-2 hover:scale-125 transition'
                        onClick={() => {
                            handleClick(getDataUrl(file.data))
                        }}
                    >
                        ❌
                    </button>
                </div>
            </div>} */}
        </div>
    )
}

export default App
