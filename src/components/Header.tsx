import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import Searchbar from "./Searchbar";
import Badge from "@mui/material/Badge";
import Stack from "@mui/material/Stack";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import { toast } from "sonner";
import { BsPersonCheck } from "react-icons/bs";
import { MdPersonOutline } from "react-icons/md";
import { FiChevronDown } from "react-icons/fi";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import MobileNavLinks from "./MobileNavLinks";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/userAuth/AuthContex";
import { auth } from "../userAuth/firebase";
import { signOut } from "firebase/auth";
import { useUser } from "../userAuth/UserContext";
import { useCart } from "./CartContext";
import ContactPageOutlinedIcon from "@mui/icons-material/ContactPageOutlined";

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartCount } = useCart();

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
      navigate("/signup", { state: { from: path } });
    }
  };

  const { fullName } = useUser();
  const getFirstName = (fullName: string | null) => {
    if (!fullName) return "";
    return fullName.split(" ")[0];
  };

  return (
    <div className="py-3 bg-white shadow-md sticky top-0 z-50">
      <div className="px-4 md:px-10 flex justify-between items-center w-full ">
        {/* MOBILE VIEW*/}
        <div className="flex flex-col w-full gap-3 item md:hidden mobile-header">
          <div className="flex justify-between">
            <div className="flex items-center space-x-3">
              {/* Hamburger Menu */}
              <MobileNavLinks />

              {/* Logo */}
              <Link to="/">
                <img src={logo} alt="logo" className="w-[70px] h-[50px]" />
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              {/* Icons */}
              <button
                onClick={() => handleProtectedClick("/welcomeUserMobile")}
                className="text-2xl"
              >
                {user ? <BsPersonCheck /> : <MdPersonOutline />}
              </button>

              <Link to="/cart" className=" ">
                <Stack spacing={2}>
                  <Badge badgeContent={cartCount} color="secondary">
                    <ShoppingCartOutlinedIcon />
                  </Badge>
                </Stack>
              </Link>
            </div>
          </div>

          {/* Searchbar */}
          <div className="w-full flex justify-center ">
              <Searchbar />
            
          </div>
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden md:flex justify-between items-center w-full space-x-6 desktop-header">
          {/* Logo */}
          <Link to="/">
            <img src={logo} alt="logo" className="w-[80px] h-[50px]" />
          </Link>

          {/* Searchbar */}
          <Searchbar />

          {/* Icons */}
          <div className="flex items-center space-x-6 ">
            {/* Person & Cart */}

            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer hover:text-[#A306BD] flex items-center gap-2 text-2xl">
                {user ? <BsPersonCheck /> : <MdPersonOutline />}
                {user && (
                  <span className="text-base font-medium">
                    Hi, {getFirstName(fullName)}
                  </span>
                )}
                <FiChevronDown className="text-lg" />
              </DropdownMenuTrigger>

              <DropdownMenuContent className="p-4 w-48 space-y-2 bg-white shadow-lg rounded-md">
                {user ? (
                  <Button
                    onClick={handleLogout}
                    className="bg-[#A306BD] hover:bg-[#8C059F] w-full text-white cursor-pointer "
                  >
                    Logout
                  </Button>
                ) : (
                  <Link to="/signin">
                    <Button className="bg-[#A306BD] hover:bg-[#8C059F]  w-full text-white cursor-pointer">
                      Sign In
                    </Button>
                  </Link>
                )}

                <Separator />

                <DropdownMenuItem
                  onClick={() => handleProtectedClick("/orders")}
                >
                  <div className="flex items-center gap-2 text-black cursor-pointer">
                    <ReceiptLongOutlinedIcon />
                    Orders
                  </div>
                </DropdownMenuItem>
                <Separator />

                <DropdownMenuItem
                  onClick={() => handleProtectedClick("/saved-items")}
                >
                  <div className="flex items-center gap-2 text-black cursor-pointer">
                    <FavoriteBorderOutlinedIcon />
                    Saved Items
                  </div>
                </DropdownMenuItem>

                <Separator />

                <DropdownMenuItem
                  onClick={() => handleProtectedClick("/address")}
                >
                  <div className="flex items-center gap-2 text-black cursor-pointer">
                    <ContactPageOutlinedIcon className="text-lg" />
                    Address Book
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/cart" className=" ">
              <Stack spacing={2}>
                <Badge badgeContent={cartCount} color="secondary">
                  <ShoppingCartOutlinedIcon />
                </Badge>
              </Stack>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
