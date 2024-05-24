import { X } from 'lucide-react'
import React from 'react'

const ConfirmModal = ({ open, onClose, onConfirm }) => {
    return (
        <div
            className={`fixed backdrop-blur-sm inset-0 z-10 flex justify-center items-center transition-colors ${open ? 'visible bg-black/20' : 'invisible'}`}
            onClick={onClose}
        >
            <div
                className={`bg-background rounded-xl shadow py-8 px-16 transition-all ${open ? 'scale-100 opacity-100' : 'scale-125 opacity-0'}`}
                onClick={e => e.stopPropagation()}
            >
                <button className='absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600'
                    onClick={onClose}
                >
                    <X />
                </button>
                <div className='font-semibold text-xl'>
                    Are you sure?
                </div>
                <div className='text-xs text-slate-600'>
                    This action cannot be undone.
                </div>
                <div className='flex mt-8 gap-4'>
                    <button
                        className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md'
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md'
                        onClick={()=>{
                            onConfirm();
                            onClose();
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal