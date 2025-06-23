import { Link } from "react-router-dom";
import logo from "../assets/footer_logo.png";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/userAuth/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const Footer = () => {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      setIsAdmin(snap.exists() && snap.data().isAdmin === true);
    };

    checkAdmin();
  }, [user]);

  return (
    <>
      <div className="bg-[#434343] py-10 px-10">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <Link to="/">
            <img src={logo} alt="logo" className="w-[100px] h-[50px]" />
          </Link>

          <span className="text-white font-bold tracking-tight flex gap-4">
            <Link to="/">
              <span>Privacy Policy </span>
            </Link>
            <Link to="/">
              <span>Terms of Service </span>
            </Link>
            <Link to="/">
              <span>FAQ </span>
            </Link>

            {isAdmin && <Link to="/admins">Admin Panel</Link>}

          </span>
        </div>
      </div>
    </>
  );
};

export default Footer;
