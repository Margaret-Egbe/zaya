import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/userAuth/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  quantity: number;
  size?: string;
}

export const useCart = () => {
  const [user] = useAuthState(auth);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(
        collection(db, "users", user.uid, "cart"),
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
              ...(doc.data() as CartItem),
              id: doc.id,
          }));
          setCartItems(items);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      const local = localStorage.getItem("guestCart");
      if (local) {
        try {
          setCartItems(JSON.parse(local));
        } catch {
          setCartItems([]);
        }
      }
      setLoading(false);
    }
  }, [user]);

  return { cartItems, loading };
};
