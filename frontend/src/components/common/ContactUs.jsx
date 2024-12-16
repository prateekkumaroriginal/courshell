import React from 'react'

const ContactUs = () => {
  return (
    <div className='flex justify-center items-center p-6 space-y-2'>
      <div className="bg-slate-100 p-8 shadow-md rounded-lg text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Contact Us</h1>
        <p className="text-gray-600 mb-6">
          The best way to reach us is through our GitHub page.
        </p>
        <a
          href="https://github.com/prateekkumaroriginal"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-2 text-white bg-purple-600/90 rounded hover:bg-purple-600 transition duration-300"
        >
          Visit Our GitHub
        </a>
      </div>
    </div>
  )
}

export default ContactUs