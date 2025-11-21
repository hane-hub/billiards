// import React from "react"; /
import { signInWithGoogle, auth } from "../firebase";

export default function LoginPage() {
  const handleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      console.log("User logged in:", result.user);
      window.location.href = "/home"; // redirect after login
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

 return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a202c] px-5 py-10 font-sans">
    
    {/* Header Section */}
    <div className="text-center mb-8 sm:mb-12">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-widest text-indigo-400 mb-5">
        POKER POOL
      </h1>
      <p className="text-gray-400 text-sm sm:text-base leading-6 max-w-xs sm:max-w-md mx-auto">
        A real-life poker billiards helper. Create a room, share the<br />
        code, and let the app handle the cards and scoring.
      </p>
    </div>

    {/* Login Card */}
    <div className="bg-[#2d3748] border border-gray-600 rounded-xl p-8 sm:p-10 w-full max-w-sm text-center">
      <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
        Welcome
      </h2>
      <p className="text-gray-400 text-base sm:text-lg mb-6">
        Sign in to play Pocket Aces.
      </p>
      
      <button
        onClick={handleLogin}
        className="w-full py-3 sm:py-4 rounded-lg bg-indigo-500 text-white font-medium text-base sm:text-lg shadow-lg hover:bg-indigo-400 transition transform hover:-translate-y-1"
      >
        Sign in with Google
      </button>
    </div>

    {/* Footer Text */}
    <p className="text-gray-500 text-xs sm:text-sm mt-4 sm:mt-6 text-center max-w-xs sm:max-w-md">
      Built for real-life play. No online gaming, just fun with friends.
    </p>
  </div>
);

}
