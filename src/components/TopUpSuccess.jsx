import React from 'react';

const TopUpSuccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Success Checkmark Icon */}
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg 
            className="w-10 h-10 text-green-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Top-Up Successful!
        </h2>
        <p className="text-gray-600 mb-8">
          Your EduEats wallet has been credited and you are ready to place your order.
        </p>

        <div className="flex flex-col space-y-3">
          <a 
            href="/menu" // Change to your menu/order route
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition"
          >
            Order Food Now
          </a>
          <a 
            href="/dashboard" // Change to your dashboard route
            className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopUpSuccess;
