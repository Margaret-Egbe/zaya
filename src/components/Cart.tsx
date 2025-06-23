import { useEffect, useState } from "react";
import { db } from "@/userAuth/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/userAuth/firebase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CartSummarySidebar from "./CartSummarySidebar";
import RecentlyViewed from "./RecentlyViewed";
import logo from "../assets/loading_logo.png";

interface CartItem {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  quantity: number;
  size?: string | null;
}

const Cart = () => {
  const [user] = useAuthState(auth);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load cart data (initial fetch)
  useEffect(() => {
    if (user) {
      const cartRef = collection(db, "users", user.uid, "cart");
      const unsubscribe = onSnapshot(cartRef, (snapshot) => {
        const items: CartItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<CartItem, "id">),
        }));
        setCartItems(items);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      const storedCart = localStorage.getItem("guestCart");
      if (storedCart) {
        try {
          const parsed = JSON.parse(storedCart);
          if (Array.isArray(parsed)) {
            setCartItems(parsed);
          } else {
            setCartItems([]);
          }
        } catch {
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
      setLoading(false);
    }
  }, [user]);

  // Live sync for guest carts
  useEffect(() => {
    if (!user) {
      const interval = setInterval(() => {
        const storedCart = localStorage.getItem("guestCart");
        if (storedCart) {
          try {
            const parsed = JSON.parse(storedCart);
            if (Array.isArray(parsed)) {
              setCartItems(parsed);
            }
          } catch {
            // skip update if broken
          }
        }
      }, 300);

      return () => clearInterval(interval);
    }
  }, [user]);

  // Save guest cart to localStorage when it changes
  useEffect(() => {
    if (!user && cartItems.length > 0) {
      localStorage.setItem("guestCart", JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const handleQuantityChange = async (itemId: string, newQty: number) => {
    if (user) {
      const itemRef = doc(db, "users", user.uid, "cart", itemId);
      if (newQty < 1) {
        await deleteDoc(itemRef);
        toast.success("Item removed");
      } else {
        await updateDoc(itemRef, { quantity: newQty });
      }
    } else {
      const updatedItems = cartItems
        .map((item) =>
          item.id === itemId ? { ...item, quantity: newQty } : item
        )
        .filter((item) => item.quantity > 0);
      setCartItems(updatedItems);
      toast.success("Cart updated");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (user) {
      const itemRef = doc(db, "users", user.uid, "cart", itemId);
      await deleteDoc(itemRef);
      toast.success("Item removed");
    } else {
      const updatedItems = cartItems.filter((item) => item.id !== itemId);
      setCartItems(updatedItems);
      toast.success("Item removed");
    }
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const productDiscount = cartItems.reduce((sum, item) => {
    if (item.oldPrice && item.oldPrice > item.price) {
      return sum + (item.oldPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img src={logo} alt="Loading..." className="w-16 h-16 animate-bounce" />
      </div>
    );
  }

  if (cartItems.length === 0)
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="bg-white p-4 rounded-full shadow-md mb-4">
          <ShoppingCartIcon style={{ fontSize: 40, color: "#A306BD" }} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Your cart is empty!
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          You have not added anything to your cart. <br />
          Browse and discover our best.
        </p>
        <Button
          className="bg-[#A306BD] text-white font-medium px-6 py-3 rounded-lg w-full sm:w-auto transition duration-300 hover:bg-[#8704a2] cursor-pointer"
          onClick={() => navigate("/")}
        >
          Start Shopping
        </Button>
      </div>
    );

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 w-full py-5 px-4 md:px-10 mt-6">
        {/* Cart Summary Sidebar */}
        <span className="w-full lg:w-1/3">
          <CartSummarySidebar
            total={totalPrice}
            productDiscount={productDiscount}
          />
        </span>

        <div className="max-w-6xl mx-auto p-6  bg-white rounded shadow-lg grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Main Cart List */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center flex-col md:flex-row justify-between mb-6 border-b pb-4 gap-7"
              >
                <Link to={`/product/${item.id}`}>
                  <div className="flex gap-4 items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 rounded bject-contain"
                    />
                    <div className="ml-2 w-full">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      {item.size && (
                        <p className="text-sm text-gray-600">
                          Size: {item.size}
                        </p>
                      )}
                      <div className="flex gap-5">
                        
                      <p className="text-sm text-gray-600">
                        ₦{item.price.toLocaleString()}
                      </p>
                      {item.oldPrice !== undefined && (
                        <p className="text-sm text-gray-600 line-through">
                          ₦{item.oldPrice.toLocaleString()}
                        </p>
                      )}
                      
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="flex flex-row items-center w-full justify-between gap-4 md:w-auto">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity - 1)
                    }
                    className="px-2 bg-gray-200 rounded font-bold cursor-pointer"
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                    className="px-2 bg-[#A306BD] rounded font-bold text-white cursor-pointer"
                  >
                    +
                  </button>

                  <p
                    onClick={() => handleRemoveItem(item.id)}
                    className="ml-4 flex items-center gap-2 cursor-pointer text-[#A306BD]"
                  >
                    <FaTrash className="text-sm" />
                    Remove
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white md:px-10 shadow-lg">
        <RecentlyViewed />
      </div>
    </>
  );
};

export default Cart;
