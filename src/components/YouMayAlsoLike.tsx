import { useEffect, useState } from "react";
import { db } from "@/userAuth/firebase";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { Link } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  images: string[];
  category: string;
}

const YouMayAlsoLike = ({
  currentProductId,
  category,
}: {
  currentProductId: string;
  category: string;
}) => {
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const q = query(
        collection(db, "products"),
        where("category", "==", category),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs
        .filter((doc) => doc.id !== currentProductId)
        .map((doc) => ({ id: doc.id, ...doc.data() } as Product));
      setSuggestions(items.slice(0, 6));
    };

    fetchSuggestions();
  }, [currentProductId, category]);

  if (suggestions.length === 0) return null;

  return (
    <div className="px-4 md:px-10 bg-white py-5 shadow-lg">
      <h3 className="text-xl font-bold mb-4">You may also like</h3>
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {suggestions.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="flex-shrink-0  transition"
          >
            <div className="min-w-[170px] md:min-w-[180px] p-3">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-34 object-contain mb-2"
              />

              <div className="mt-2 items-center flex flex-col">
                <p className="text-sm font-semibold line-clamp-1 truncate w-[140px] md:w-auto">
                  {product.name}
                </p>

                <div className="flex items-center gap-2">
                  <p className="text-lg text-red-600 ">
                    ₦{product.price.toLocaleString()}
                  </p>

                  {product.oldPrice !== undefined && (
                    <span className="text-gray-500 text-sm line-through ml-2">
                      ₦{product.oldPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default YouMayAlsoLike;
