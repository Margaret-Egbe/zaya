import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../userAuth/firebase";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice: number;
  images: string[];
}

const Explore: React.FC = () => {
  const [explore, setExplore] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      const explore = data.filter((product) => product.isExplore);
      setExplore(explore as Product[]);
      setLoading(false);
    };

    fetchDeals();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-3 shadow space-y-3">
            <Skeleton className="w-full h-44 bg-gray-200 rounded" />
            <Skeleton className="h-4 w-3/4 bg-gray-200 rounded" />
            <Skeleton className="h-4 w-1/2 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {explore.map((product) => (
        <Link to={`/product/${product.id}`} key={product.id}>
          <div className="min-w-[170px] md:min-w-[180px] bg-white rounded-lg p-3 text-black shadow hover:shadow-lg cursor-pointer">
            <img
              src={product.images?.[0]}
              alt={product.name}
              className="w-full h-50 object-contain mb-5 bg-gray-100 rounded"
            />
            <h4 className="text-sm font-bold line-clamp-2">{product.name}</h4>
            <span className="text-red-500 font-semibold text-sm">
              ₦{product.price.toLocaleString()}
            </span>
            {product.oldPrice && (
              <span className="text-gray-500 text-sm line-through ml-2">
                ₦{product.oldPrice.toLocaleString()}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Explore;
