import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    DragDropContext,
    Draggable,
    Droppable,
} from "@hello-pangea/dnd";
import { Grip, Pencil } from "lucide-react";

const ModulesList = ({ items, onReorder }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [modules, setModules] = useState(items);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setModules(items);
    }, [items]);

    if (!isMounted){
        return null;
    }

    const onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const items = Array.from(modules);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setModules(items);

        const startIndex = Math.min(result.source.index, result.destination.index);
        const endIndex = Math.max(result.source.index, result.destination.index);
        const updatedModules = items.slice(startIndex, endIndex + 1);

        const bulkUpdateData = updatedModules.map(module => ({
            id: module.id,
            position: items.findIndex(item => item.id === module.id) + 1
        }));

        onReorder(bulkUpdateData);
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId='modules'>
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                        {modules.map((module, index) => {
                            const published = module.articles.some(article => article.published);

                            return (
                                <Draggable
                                    key={module.id}
                                    draggableId={module.id}
                                    index={index}
                                >
                                    {(provided) => (
                                        <div
                                            className={`flex items-center gap-x-2 bg-slate-300 border-slate-200 border text-slate-700 rounded-md mb-2 text-sm ${published && "bg-sky-100 border-sky-200 text-sky-700"}`}
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                        >
                                            <div
                                                className={`px-2 py-3 cursor-grab border-r border-r-slate-200 hover:bg-slate-400 active:bg-slate-400 rounded-l-md transition ${published && "hover:bg-sky-200 border-r-sky-200"}`}
                                                {...provided.dragHandleProps}
                                            >
                                                <Grip className='h-5 w-5' />
                                            </div>

                                            <Link to={module.id} className='px-2 py-1 hover:underline'>
                                                {module.title}
                                            </Link>

                                            <div className='ml-auto pr-2 flex items-center gap-x-2'>
                                                <div
                                                    className={`text-white px-2 py-1 font-semibold rounded-full text-xs cursor-default ${published ? "bg-sky-700 hover:bg-sky-800" : "bg-slate-600 hover:bg-slate-700"}`}
                                                >
                                                    {published ? "Published" : "Draft"}
                                                </div>
                                                <Link to={module.id} className='hover:underline py-1 cursor-pointer hover:opacity-75 transition'>
                                                    <Pencil className='w-4 h-4' />
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            )
                        })}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}

export default ModulesList