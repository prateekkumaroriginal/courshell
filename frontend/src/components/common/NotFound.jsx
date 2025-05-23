import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div
      className="flex items-center justify-center p-6"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
        <p className="text-2xl text-red-800 mb-2">Page Not Found</p>
        <p className="text-gray-600 mb-6">
          Sorry, the page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
