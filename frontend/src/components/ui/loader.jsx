import React from 'react';
import { useLoader } from '@/hooks/useLoaderStore';

const Loader = () => {
  const { isMainLoading } = useLoader();

  return (
    <div className={`fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all ${isMainLoading ? 'scale-100 opacity-100 visible' : 'scale-125 opacity-0 invisible'}`}>
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-indigo-300 to-purple-300 animate-spin" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', animationDuration: '1.5s' }}></div>
        <div className="relative left-2 lg:left-3 flex items-center gap-x-0.5 text-white text-sm font-medium">
          <span className='text-xl md:text-2xl lg:text-3xl'>Loading</span>
          <div className="relative flex gap-x-0.5 -top-1">
            {[0, 1, 2].map((ind) => (
              <span
                className="inline-block animate-bounce text-3xl md:text-4xl lg:text-5xl"
                style={{ animationDelay: `${ind * 0.2}s`, animationDuration: '1s' }}
              >
                .
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loader;