import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import JoditEditor from 'jodit-react';
import { useParams } from 'react-router-dom';

const Editor = ({ defaultContent }) => {
    const { courseId, moduleId, articleId } = useParams();
    const editor = useRef(null);
    const [content, setContent] = useState(defaultContent || '');
    const [placeholder, setPlaceholder] = useState('Start typing...');

    const config = useMemo(() => ({
        readonly: false,
        placeholder: placeholder,
        height: '600px',
    }), [placeholder]);

    const saveContent = useCallback((event) => {
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            localStorage.setItem('joditContent', content);
            console.log(localStorage.getItem('joditContent'));
        }
    }, [content]);

    useEffect(() => {
        document.addEventListener("keydown", saveContent);
        return () => {
            document.removeEventListener("keydown", saveContent);
        };
    }, [saveContent]);

    useEffect(() => {
        if (!defaultContent) {
            const data = localStorage.getItem('joditContent');
            if (data) {
                setPlaceholder("");
                setContent(data);
            };
        }
    }, []);

    const handleSubmit = async () => {
        try {
            const response = await fetch(`http://localhost:3000/instructor/courses/${courseId}/modules/${moduleId}/articles/${articleId}`, {
                method: 'PATCH',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    content
                })
            });
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className='flex flex-col relative'>
            <div className="z-10 absolute bottom-20 right-20">
                <button
                    onClick={handleSubmit}
                    className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md'
                >
                    Save
                </button>
            </div>

            <JoditEditor
                ref={editor}
                value={content}
                config={config}
                tabIndex={1}
                onChange={newContent => { setContent(newContent) }}
            />
        </div>
    );
}

export default Editor