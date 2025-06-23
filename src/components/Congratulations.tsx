import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const Congratulations = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { amount, orderId } = location.state || {};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-[#f5f5f5]">
      <CheckCircle2 size={80} className="text-green-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">
        {" "}
        Thank you for shopping with us.
      </h1>
      <p className="text-gray-700 mb-4">
        Your payment of <strong>₦{amount?.toLocaleString()}</strong> was
        successful.
      </p>
      <p className="text-gray-600 mb-4">
        <strong>Order ID:</strong>{" "}
        <span className="text-[#A306BD]">{orderId}</span>
      </p>
      <p className="text-gray-500 mb-8">
        You’ll receive an email confirmation shortly.
      </p>
      <Button
      className="bg-[#A306BD]  hover:bg-[#8704a2] w-full sm:w-auto transition duration-300 cursor-pointer"
       onClick={() => navigate("/")}>Back to Home</Button>
    </div>
  );
};

export default Congratulations;
