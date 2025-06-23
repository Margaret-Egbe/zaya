// components/WishlistHeart.tsx
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { doc, deleteDoc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/userAuth/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/userAuth/firebase";

interface WishlistHeartProps {
  product: {
    id: string;
    name: string;
    price: number;
    oldPrice?: number;
    images?: string[];
  };
}

const WishlistHeart: React.FC<WishlistHeartProps> = ({ product }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

 useEffect(() => {
  if (!user || !product?.id) return;

  const savedRef = doc(db, "users", user.uid, "savedItems", product.id);

  const unsubscribe = onSnapshot(savedRef, (docSnap) => {
    setIsSaved(docSnap.exists());
  });

  return () => unsubscribe(); // ✅ this is OK
}, [user, product?.id]);


  const handleToggleSaved = async (e: React.MouseEvent) => {
     e.stopPropagation(); // 🛑 prevent parent click from firing
    e.preventDefault();  

    if (!user) {
      navigate("/signin");
      return;
    }

    const savedRef = doc(db, "users", user.uid, "savedItems", product.id);
    const docSnap = await getDoc(savedRef);

    if (docSnap.exists()) {
      await deleteDoc(savedRef);
      toast.success("Removed from wish list!");
      setIsSaved(false);
    } else {
      await setDoc(savedRef, {
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        image: product.images?.[0],
        timestamp: serverTimestamp(),
      });
      toast.success("Added to wish list!");
      setIsSaved(true);
    }
  };

  return (
    <div
      className="absolute top-3 right-3 text-red-500  z-10 text-2xl cursor-pointer transition-transform duration-200 hover:scale-125"
      onClick={handleToggleSaved}
    >
      {isSaved ? <FaHeart /> : <FaRegHeart />}
    </div>
  );
};

export default WishlistHeart;
