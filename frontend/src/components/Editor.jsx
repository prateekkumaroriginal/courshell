import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import JoditEditor from 'jodit-react';

const Editor = () => {
    const editor = useRef(null);
    const [content, setContent] = useState('');
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
        const data = localStorage.getItem('joditContent');
        if (data) {
            setPlaceholder("");
            setContent(data);
        };
    }, []);

    return (
        // TODO Click save button to get html content and save to db
        <JoditEditor
            ref={editor}
            value={content}
            config={config}
            tabIndex={1}
            onChange={newContent => { setContent(newContent) }}
        />
    );
}

export default Editor