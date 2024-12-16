import React from 'react';

const Shipping = () => {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl text-center font-bold text-gray-800">Access & Delivery</h1>
      <ul className='list-disc list-outside pl-6'>
        <li className="text-gray-600">
          We ensure seamless access to your purchased digital courses. Below are our access and delivery policies.
        </li>
        <li className="text-gray-600">
          Access is granted immediately after payment confirmation. In rare cases, it may take up to 24 hours.
        </li>
        <li className="text-gray-600">
          If you face any issues accessing your courses, please contact us through our GitHub page.
        </li>
      </ul>

      <div className='flex w-full justify-center'>
        <a
          href="https://github.com/YOUR_GITHUB_USERNAME"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-2 text-white bg-purple-600/90 rounded hover:bg-purple-700 transition duration-300"
        >
          Visit Our GitHub
        </a>
      </div>
    </div>
  );
};

export default Shipping;
