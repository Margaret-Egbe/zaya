import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { loginUser } from "./loginUser";
import { toast, Toaster } from "sonner";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { FcGoogle } from "react-icons/fc";
import { ClipLoader } from "react-spinners";
import { signInWithGoogle } from "../userAuth/signInWithGoogle";
import logo from "../assets/logo.png";
import { FiChevronLeft } from "react-icons/fi";

const SignInPage: React.FC<{ toggleAuth: () => void }> = ({ toggleAuth }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);

   const location = useLocation();
 
  const from = (location.state as { from?: string })?.from || "/";

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Start loading
    try {
      await loginUser(email, password);
      toast.success("Welcome back", {
        duration: 500,
        position: "top-center",
      });
      navigate(from, { replace: true });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="flex items-center justify-center px-4">
      <div className="p-6">
        <Link to={"/signup"}>
          <FiChevronLeft className="text-lg" />
        </Link>
        {/* Logo */}
        <Link to={"/"}>
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Logo" className="h-10" />
          </div>
        </Link>

        <h2 className="text-center text-2xl font-semibold text-black">
          Sign In
        </h2>
        <p className="text-center text-sm text-gray-600 mb-5">Welcome back!</p>
        <Toaster />

        <form onSubmit={handleSignIn} className="space-y-4">
          {/* Full Name */}
          <div>
            {/* Google Sign-In */}
            <button
              type="button"
              disabled={googleLoading}
              className="flex items-center justify-center w-full border border-purple-500 text-blue-700 py-2 mb-3 gap-2 hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
               onClick={async () => {
              setGoogleLoading(true);
              await signInWithGoogle(() => navigate(from, { replace: true }));
              setGoogleLoading(false);
            }}
          >
            {googleLoading ? (
              <ClipLoader color="#9333ea" size={20} />
              ) : (
                <>
                  <FcGoogle size={20} />
                  <span className="ml-2">
                    Sign in with{" "}
                    <span className="font-semibold">
                      <span className="text-blue-500">G</span>
                      <span className="text-red-500">o</span>
                      <span className="text-yellow-500">o</span>
                      <span className="text-blue-500">g</span>
                      <span className="text-green-500">l</span>
                      <span className="text-red-500">e</span>
                    </span>
                  </span>
                </>
              )}
            </button>

            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-2 border-purple-300 border-b-2 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              required
              className="w-full px-4 py-2 border-b-2 border-purple-300 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Password with visibility toggle */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
              className="w-full px-4 py-2 border-b-2 border-purple-300 focus:outline-none focus:border-purple-500 pr-10"
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
            >
              {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition shadow-xl"
          >
            {loading ? <ClipLoader color="#fff" size={20} /> : "Sign Up"}
          </button>
        </form>

        {/* Footer Links */}
        <div className="flex justify-between text-sm text-gray-500 mt-4">
          <Link to="/forgetpsw" className="hover:text-purple-500">
            Forgot Password?
          </Link>

          <Link to={"/signup"}>
            <button
              type="button"
              onClick={toggleAuth}
              className="hover:text-purple-500"
            >
              Create an account
            </button>
          </Link>
        </div>

        {/* Footer Branding */}
        <div className="text-center flex justify-center mt-4">
          <img src={logo} alt="Logo" className="h-7" />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
