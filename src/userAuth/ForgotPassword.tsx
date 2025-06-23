import React, { useState } from "react";
import resetPassword from "./resetPassword";
import { toast, Toaster } from "sonner";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ForgetPsw = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleForgetPassword = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email field cannot be empty");
      return;
    }
    try {
      await resetPassword(email);
      setTimeout(() => {
        navigate("/signin", { replace: true }); // ← Goes back to signin after 3 seconds
      }, 3000);
    } catch (error) {}
  };

  return (
    <div className="flex justify-center items-center  px-6 py-12">
      <div className="p-6">
        <Toaster />
        <Link to={"/signin"}>
          <FiChevronLeft className="text-lg" />
        </Link>
        {/* Logo */}
        <Link to={"/"}>
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Logo" className="h-10" />
          </div>
        </Link>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Reset Your Password
        </h2>
        <p className="text-center text-gray-600 mb-8 leading-relaxed">
          Enter your registered email, and we'll send you a password reset link.
        </p>
        <form className="space-y-6 space-x-8 p-8">
          <input
            type="email"
            placeholder="Enter your email"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            value={email}
            className="w-full px-4 py-2 border-b-2 border-purple-300 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            onClick={handleForgetPassword}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition shadow-xl"
          >
            Send Reset Link
          </button>
          {/* Footer Branding */}
          <div className="text-center flex justify-center mt-4">
            <img src={logo} alt="Logo" className="h-7" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgetPsw;
