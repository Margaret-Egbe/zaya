import React, { useState } from "react";
import { toast } from "sonner";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { createUser } from "../userAuth/createUser";
import { signInWithGoogle } from "../userAuth/signInWithGoogle";
import logo from "../assets/logo.png";
import { FiChevronLeft } from "react-icons/fi";

const SignUpPage: React.FC<{ toggleAuth: () => void }> = ({ toggleAuth }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const fullName = `${firstName} ${lastName}`;
    setLoading(true);

    try {
      await createUser(email, password, fullName, () => navigate(from));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4">
      <div className="p-6">
        <Link to={"/"}>
          <FiChevronLeft className="text-lg" />
        </Link>

        {/* Logo */}
        <Link to={"/"}>
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Logo" className="h-10" />
          </div>
        </Link>

        <h2 className="text-center text-2xl font-semibold text-black">Sign Up</h2>
        <p className="text-center text-sm text-gray-600 mb-5">Create your account</p>

        {/* Google Sign-In */}
        <button
          type="button"
          disabled={googleLoading}
          className="flex items-center justify-center w-full border border-purple-500 text-blue-700 py-2 mb-3 gap-2 hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={async () => {
            setGoogleLoading(true);
            await signInWithGoogle(navigate, from); // ✅ pass "from"
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

        {/* Divider */}
        <div className="relative text-center text-gray-400 my-3 text-sm">
          <span className="bg-white px-2 z-10 relative">OR</span>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gray-300 transform -translate-y-1/2"></div>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-1/2 border border-purple-400 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-1/2 border border-purple-400 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
              required
            />
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-purple-400 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-purple-400 px-4 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-purple-500"
              required
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-purple-400 px-4 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-purple-500"
              required
            />
            <div
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
            >
              {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition shadow-xl"
          >
            {loading ? <ClipLoader color="#fff" size={20} /> : "Sign Up"}
          </button>
        </form>

        {/* Footer Links */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/signin">
            <button
              onClick={toggleAuth}
              className="text-purple-600 font-medium hover:underline"
            >
              Sign in
            </button>
          </Link>
        </p>

        {/* Footer Branding */}
        <div className="text-center flex justify-center mt-4">
          <img src={logo} alt="Logo" className="h-7" />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
