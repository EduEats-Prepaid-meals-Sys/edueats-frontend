import React from 'react';
import { Link } from 'react-router-dom';

const TopUpFailed = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Failure Icon */}
        <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Top-Up Failed
        </h2>
        <p className="text-gray-600 mb-8">
          Your payment could not be processed. Please try again or use a different payment method.
        </p>

        <div className="flex flex-col space-y-3">
          <Link
            to="/student/wallet"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition"
          >
            Try Again
          </Link>
          <Link
            to="/student/home"
            className="w-full block bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopUpFailed;
