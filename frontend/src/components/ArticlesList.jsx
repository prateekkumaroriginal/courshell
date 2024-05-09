import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    DragDropContext,
    Draggable,
    Droppable,
} from "@hello-pangea/dnd";
import { Grip, Pencil } from "lucide-react";

const ArticlesList = ({ items, onReorder, onEdit }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [articles, setArticles] = useState(items);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setArticles(items);
    }, [items]);

    if (!isMounted) {
        return null;
    }

    const onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const items = Array.from(articles);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setArticles(items);

        const startIndex = Math.min(result.source.index, result.destination.index);
        const endIndex = Math.max(result.source.index, result.destination.index);
        const updatedArticles = items.slice(startIndex, endIndex + 1);

        const bulkUpdateData = updatedArticles.map(article => ({
            _id: article._id,
            position: items.findIndex(item => item._id === article._id) + 1
        }));

        onReorder(bulkUpdateData);
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId='articles'>
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                        {articles.map((article, index) => (
                            <Draggable
                                key={article._id}
                                draggableId={article._id}
                                index={index}
                            >
                                {(provided) => (
                                    <div
                                        className={`flex items-center gap-x-2 bg-slate-300 border-slate-200 border text-slate-700 rounded-md mb-2 text-sm ${article.published && "bg-sky-100 border-sky-200 text-sky-700"}`}
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                    >
                                        <div
                                            className={`px-2 py-3 cursor-grab border-r border-r-slate-200 hover:bg-slate-400 active:bg-slate-400 rounded-l-md transition ${article.published && "hover:bg-sky-200 border-r-sky-200"}`}
                                            {...provided.dragHandleProps}
                                        >
                                            <Grip className='h-5 w-5' />
                                        </div>

                                        <Link to={article._id} className='px-2 py-1 hover:underline'>
                                            {article.title}
                                        </Link>

                                        <div className='ml-auto pr-2 flex items-center gap-x-2'>
                                            <div
                                                className={`text-white px-2 py-1 font-semibold rounded-full text-xs cursor-default ${article.published ? "bg-sky-700 hover:bg-sky-800" : "bg-slate-600 hover:bg-slate-700"}`}
                                            >
                                                {article.published ? "Published" : "Draft"}
                                            </div>
                                            <Link to={article._id} className='hover:underline py-1 cursor-pointer hover:opacity-75 transition'>
                                                <Pencil className='w-4 h-4' />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </Draggable>
                        )
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}

export default ArticlesList