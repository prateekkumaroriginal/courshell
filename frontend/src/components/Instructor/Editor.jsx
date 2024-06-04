import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import JoditEditor from 'jodit-react';
import { useParams } from 'react-router-dom';
import { VITE_APP_BACKEND_URL } from '@/constants';
import toast from 'react-hot-toast';

const Editor = ({ defaultContent }) => {
    const { courseId, moduleId, articleId } = useParams();
    const editor = useRef(null);
    const [content, setContent] = useState(defaultContent || '');
    const [placeholder, setPlaceholder] = useState('Start typing...');
    const [isFullScreen, setIsFullScreen] = useState(false);

    const config = useMemo(() => ({
        readonly: false,
        placeholder: placeholder,
        height: '600px',
        toolbarStickyOffset: 57
    }), [placeholder, isFullScreen]);

    const saveContent = useCallback((event) => {
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            localStorage.setItem(`joditContent-${articleId}`, content);
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
            const data = localStorage.getItem(`joditContent-${articleId}`);
            if (data) {
                setPlaceholder("");
                setContent(data);
            };
        }
    }, []);

    // useEffect(() => {
    //     const handleFullScreenChange = () => {
    //         if (editor.current) {
    //             const isFullScreenMode = editor.current.isFullSize;
    //             setIsFullScreen(isFullScreenMode);
    //         }
    //     };

    //     const editorInstance = editor.current;
    //     if (editorInstance) {
    //         editorInstance.events.on('afterSetMode', handleFullScreenChange);
    //     }

    //     return () => {
    //         if (editorInstance) {
    //             editorInstance.events.off('afterSetMode', handleFullScreenChange);
    //         }
    //     };
    // }, []);

    const handleSubmit = async () => {
        try {
            const updatingToast = toast.loading("Updating...");
            const response = await fetch(`${VITE_APP_BACKEND_URL}/instructor/courses/${courseId}/modules/${moduleId}/articles/${articleId}`, {
                method: 'PATCH',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    content
                })
            });
            toast.dismiss(updatingToast);

            if (response.ok) {
                toast.success("Article Updated");
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
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