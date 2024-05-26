import { VITE_APP_BACKEND_URL } from '@/constants';
import { Download } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const getUrlAndType = (attachment) => {
    if (!attachment) return null;
    const { data, type } = attachment;
    return [`data:${type};base64,${data}`, type]
}

const Attachment = () => {
    const { courseId, attachmentId } = useParams();
    const [attachment, setAttachment] = useState();

    const fetchAttachment = async () => {
        try {
            const response = await fetch(`${VITE_APP_BACKEND_URL}/instructor/courses/${courseId}/attachments/${attachmentId}`, {
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch attachment');
            }

            const data = await response.json();
            setAttachment(data.attachment);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchAttachment();
    }, [attachmentId]);


    const renderAttachmentPreview = () => {
        const urlAndType = getUrlAndType(attachment);
        if (!urlAndType) return null;
        const [url, type] = urlAndType;

        switch (type) {
            case 'image/png':
            case 'image/jpg':
            case 'image/jpeg':
                return (
                    <div className='mt-8 h-[600px] md:h-[500px] 2xl:h-[700px] flex flex-col justify-center items-center'>
                        <a href={url} className='m-2 flex items-center rounded-md bg-gray-600 text-white p-2 hover:bg-gray-700' download={attachment.originalName}>
                            <Download className='h-4 w-4 mr-2' /> Download
                        </a>
                        <img src={url} alt="attachment preview" className='object-cover h-full' />
                    </div>
                );
            case 'application/pdf':
                return <embed src={url} type={type} className='w-full h-lvh' />;
            default:
                return <a href={url} download={attachment.originalName}>{attachment.originalName}</a>;
        }
    };

    return (
        <div className=''>
            {renderAttachmentPreview()}
        </div>
    );
};

export default Attachment;
