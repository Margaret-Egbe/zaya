import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/userAuth/firebase";
import { Link } from "react-router-dom";

type ViewedProduct = {
  id: string;
  name: string;
  image: string;
  price: number;
};

const RecentlyViewed = () => {
  const [user] = useAuthState(auth);
  const [products, setProducts] = useState<ViewedProduct[]>([]);

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      if (user) {
        const snapshot = await getDocs(
          collection(db, "users", user.uid, "recentlyViewed")
        );
        const data = snapshot.docs.map((doc) => doc.data() as ViewedProduct);
        setProducts(data.reverse());
      } else {
        const stored = localStorage.getItem("recentlyViewed");
        const data: ViewedProduct[] = stored ? JSON.parse(stored) : [];
        setProducts(data);
      }
    };

    fetchRecentlyViewed();
  }, [user]);

  if (products.length === 0) return null;

  return (
    <div className="my-10 py-5">
      <h2 className="text-xl font-bold mb-4 px-4">Recently Viewed</h2>
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {products.map((product) => (
          <Link
            to={`/product/${product.id}`}
            key={product.id}
            className="min-w-[160px] bg-white   hover:scale-105 transition"
          >
            <div className="min-w-[170px] md:min-w-[180px] p-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-34 object-contain mb-2"
              />
              <p className="mt-2 text-sm font-medium line-clamp-1">
                {product.name}
              </p>
              <p className="text-xs text-gray-500">
                ₦{product.price.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
