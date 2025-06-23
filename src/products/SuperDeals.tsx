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

const SuperDeals: React.FC = () => {
  const [deals, setDeals] = useState<Product[]>([]);
   const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchDeals = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      const superDeals = data.filter((product) => product.isSuperDeal);
      setDeals(superDeals as Product[]);
      setLoading(false);
    };

    fetchDeals();
  }, []);

   if (loading) {
  return (
    <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-white px-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="min-w-[170px] md:min-w-[180px] bg-white rounded-lg p-3 shadow space-y-2"
        >
          <Skeleton className="w-full h-32 md:h-36 bg-gray-200 rounded" />
          <Skeleton className="h-4 w-3/4 bg-gray-200 rounded" />
          <Skeleton className="h-4 w-1/2 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

  return (
    
   <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-white">
      {deals.map((product) => (
        <Link to={`/product/${product.id}`} key={product.id}>
          <div className="min-w-[170px] md:min-w-[180px] bg-white rounded-lg p-3 text-black shadow hover:shadow-lg cursor-pointer">
            <img
              src={product.images?.[0]}
              alt={product.name}
              className="w-full h-34 object-contain mb-2 bg-gray-100 rounded"
            />
            <h4 className="text-sm font-bold line-clamp-2">{product.name}</h4>
            <span className="text-black font-semibold text-sm">
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

export default SuperDeals;
