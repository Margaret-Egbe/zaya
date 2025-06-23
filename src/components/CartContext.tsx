import { createContext, useContext, useEffect, useState } from "react";
import { db, auth } from "@/userAuth/firebase";
import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

const CartContext = createContext<{ cartCount: number }>({ cartCount: 0 });

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [user] = useAuthState(auth);
  const [cartCount, setCartCount] = useState(0);

  // 🔄 Sync guest cart to Firestore on login
  useEffect(() => {
    const syncGuestCartToFirestore = async () => {
      const guestCart = localStorage.getItem("guestCart");

      if (user && guestCart) {
        try {
          const parsedCart = JSON.parse(guestCart);
          if (Array.isArray(parsedCart)) {
            // Fetch existing user cart to avoid duplicates
            const existingDocs = await getDocs(
              collection(db, "users", user.uid, "cart")
            );
            const existingIds = new Set(existingDocs.docs.map((doc) => doc.id));

            await Promise.all(
              parsedCart.map(async (item: any) => {
                if (!existingIds.has(item.id)) {
                  await setDoc(
                    doc(db, "users", user.uid, "cart", item.id),
                    item
                  );
                }
              })
            );
          }

          localStorage.removeItem("guestCart"); // ✅ Clear guest cart
        } catch (err) {
          console.error("Failed to sync guest cart:", err);
        }
      }
    };

    syncGuestCartToFirestore();
  }, [user]);

  // 🔁 Listen to cart updates (Firestore for logged-in, localStorage for guest)
  useEffect(() => {
    if (user) {
      const cartCol = collection(db, "users", user.uid, "cart");
      const unsubscribe = onSnapshot(cartCol, (snapshot) => {
        const count = snapshot.docs.reduce(
          (total, doc) => total + (doc.data().quantity || 1),
          0
        );
        setCartCount(count);
      });

      return () => unsubscribe();
    } else {
      const updateGuestCount = () => {
        const storedCart = localStorage.getItem("guestCart");
        if (storedCart) {
          try {
            const items = JSON.parse(storedCart);
            const count = items.reduce(
              (total: number, item: any) => total + item.quantity,
              0
            );
            setCartCount(count);
          } catch {
            setCartCount(0);
          }
        } else {
          setCartCount(0);
        }
      };

      updateGuestCount(); // initial
      const interval = setInterval(updateGuestCount, 300); // updates every 300ms

      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <CartContext.Provider value={{ cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
