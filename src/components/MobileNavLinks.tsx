import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTrigger,
  SheetTitle,
} from "./ui/sheet";
import logo from "../assets/logo.png";
import { Separator } from "./ui/separator";
import { useAuth } from "@/userAuth/AuthContex";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

const MobileNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);

  const handleProtectedClick = (path: string) => {
    if (user) {
      navigate(path);
    } else {
      navigate("/signup", { state: { from: path } });
    }
  };

  const popularCategories = [
    { display: "Fahion", icon: "👗", linkTo: "Apparel" },
    { display: "Gadgets", icon: "🖥️", linkTo: "Laptops" },
    { display: "Headphones", icon: "🎧", linkTo: "HeadPhones" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <MenuIcon />
      </SheetTrigger>

      <SheetContent side="left" className="flex flex-col p-3">
        <SheetTitle>
          <Link to="/" onClick={handleClose}>
            <img src={logo} alt="logo" className="w-[70px] h-[50px]" />
          </Link>
        </SheetTitle>

        <Separator />

        <SheetDescription className="flex flex-col gap-4 mt-10">
          <SheetTitle className="text-[#A306BD] font-medium">
            My Account
          </SheetTitle>

          <div
            onClick={() => handleProtectedClick("/orders")}
            className="flex items-center gap-2 text-black cursor-pointer"
          >
            <ReceiptLongOutlinedIcon className="text-lg" />
            Track Orders
          </div>

          <div
            onClick={() => handleProtectedClick("/saved-items")}
            className="flex items-center gap-2 text-black cursor-pointer"
          >
            <FavoriteBorderOutlinedIcon />
            Saved Items
          </div>

          <Separator />

          <SheetTitle className="text-[#A306BD] font-medium">
            Popular Categories
          </SheetTitle>

          {popularCategories.map((cat) => (
            <Link
              key={cat.display}
              to={`/category/${cat.linkTo}`}
              onClick={handleClose}
              className="flex items-center gap-2 text-black"
            >
              <span className="text-xl">{cat.icon}</span>
              {cat.display}
            </Link>
          ))}
        </SheetDescription>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
