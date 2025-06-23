import { Button } from "@/components/ui/button";
import { auth } from "@/userAuth/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import { useAuth } from "@/userAuth/AuthContex";
import { useUser } from "../userAuth/UserContext";
import ContactPageOutlinedIcon from "@mui/icons-material/ContactPageOutlined";

const WelcomeUserMobile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { fullName } = useUser();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/", { replace: true });
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const handleProtectedClick = (path: string) => {
    if (user) {
      navigate(path);
    } else {
      navigate("/signin", { state: { from: path } });
    }
  };

  const getFirstName = (fullName: string | null) => {
    if (!fullName) return "";
    return fullName.split(" ")[0];
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-2xl shadow-md px-6 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Welcome,{" "}
            <span className="text-primary">{getFirstName(fullName)}</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            We're glad to have you back!
          </p>
        </div>

        <div className="space-y-4">
          <div
            onClick={() => handleProtectedClick("/orders")}
            className="flex items-center gap-3 text-gray-700 cursor-pointer hover:text-primary transition"
          >
             <ReceiptLongOutlinedIcon
              className="text-lg"
              />
                  
           
            <span className="text-base font-medium">Orders</span>
          </div>

          <div
            onClick={() => handleProtectedClick("/saved-items")}
            className="flex items-center gap-3 text-gray-700 cursor-pointer hover:text-primary transition"
          >
            <FavoriteBorderOutlinedIcon className="text-lg" />
            <span className="text-base font-medium">Saved Items</span>
          </div>

          <div
            onClick={() => handleProtectedClick("/address")}
            className="flex items-center gap-3 text-gray-700 cursor-pointer hover:text-primary transition"
          >
            <ContactPageOutlinedIcon className="text-lg" />
            <span className="text-base font-medium">Address Book</span>
          </div>
        </div>

        <div className="pt-4">
          <Button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white text-base font-medium py-2 rounded-lg"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeUserMobile;
