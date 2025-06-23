import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "@/userAuth/firebase";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import logo from "../assets/loading_logo.png";
import { FaTrash } from "react-icons/fa";

interface SavedItem {
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  timestamp?: any;
}

const SavedItems: React.FC = () => {
  const [user] = useAuthState(auth);
  const [savedItems, setSavedItems] = useState<
    { id: string; data: SavedItem }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user === undefined) return; // still checking auth

    if (!user) {
      setSavedItems([]);
      setLoading(false);
      return;
    }

    const savedItemsRef = collection(db, "users", user.uid, "savedItems");

    const unsubscribe = onSnapshot(savedItemsRef, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data() as SavedItem,
      }));
      setSavedItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleRemove = async (productId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "savedItems", productId));
    toast.success("Removed from saved items");
  };

  if (!user && !loading) {
    return (
      <div className="text-center mt-20 text-lg">
        Please{" "}
        <span
          className="text-[#A306BD] font-semibold cursor-pointer"
          onClick={() => navigate("/signin")}
        >
          sign in
        </span>{" "}
        to view your saved items.
      </div>
    );
  }

  const handleAddToCart = async (itemId: string, itemData: SavedItem) => {
    if (user) {
      const cartRef = doc(db, "users", user.uid, "cart", itemId);
      try {
        await setDoc(cartRef, {
          ...itemData,
          quantity: 1,
        });
        toast.success("Item added to cart");
      } catch (err) {
        toast.error("Failed to add to cart");
      }
    } else {
      const storedCart = localStorage.getItem("guestCart");
      let updatedCart = [];

      if (storedCart) {
        try {
          updatedCart = JSON.parse(storedCart);
        } catch {
          updatedCart = [];
        }
      }

      const itemExists = updatedCart.find((item: any) => item.id === itemId);
      if (!itemExists) {
        updatedCart.push({ id: itemId, ...itemData, quantity: 1 });
        localStorage.setItem("guestCart", JSON.stringify(updatedCart));
        toast.success("Item added to cart");
      } else {
        toast("Item already in cart");
      }
    }
  };

  // 🔥 Bouncing loader
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img src={logo} alt="Loading..." className="w-16 h-16 animate-bounce" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6"> Wish List </h1>

      {savedItems.length === 0 ? (
        <p className="text-gray-600">You haven’t saved any items yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {savedItems.map(({ id, data }) => (
            <div
              key={id}
              className="flex flex-col md:flex-row items-center border rounded-lg p-4 shadow-sm hover:shadow-md transition justify-between"
            >
              <Link
                to={`/product/${id}`}
                className="flex flex-row w-full md:w-auto"
              >
                <img
                  src={data.image}
                  alt={data.name}
                  className="w-24 h-24 object-contain mb-4 md:mb-0 md:mr-4 border rounded"
                />
                
                <div className="flex flex-col justify-center ml-3">
                  <h3 className="text-lg font-semibold">{data.name}</h3>
                  <div className="flex">
                    <p className="text-[#A306BD] font-bold">
                      ₦{data.price.toLocaleString()}
                    </p>

                    {data.oldPrice !== undefined && (
                      <span className="text-gray-500 text-sm line-through ml-2">
                        ₦{data.oldPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              <div className="flex flex-row gap-4 mt-4 md:mt-0 justify-between md:justify-start items-center w-full md:w-auto">
                <p
                  className="flex items-center gap-2 cursor-pointer border-red-400 text-red-500"
                  onClick={() => handleRemove(id)}
                >
                  <FaTrash className="text-sm" />
                  Remove
                </p>
                <Button
                  onClick={() => handleAddToCart(id, data)}
                  className="bg-[#A306BD] cursor-pointer hover:bg-[#8C059F]
                transition duration-200"
                >
                  Add to cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedItems;
