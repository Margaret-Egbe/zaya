import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../userAuth/firebase";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  price: number;
  images: string[];
}

const WeeklyDeals: React.FC = () => {
  const [weekly, setWeekly] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      const weeklyDeals = data.filter((product) => product.isWeeklyDeals);
      setWeekly(weeklyDeals as Product[]);
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
            className="min-w-[170px] md:min-w-[180px] bg-white rounded-lg p-3 shadow space-y-2 flex flex-col items-center"
          >
            <Skeleton className="w-full h-32 md:h-36 bg-gray-200 rounded" />
            <Skeleton className="h-4 w-2/3 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-white">
      {weekly.map((product) => (
        <Link to={`/product/${product.id}`} key={product.id}>
          <div className="min-w-[170px] md:min-w-[180px] bg-white rounded-lg p-3 text-black shadow hover:shadow-lg cursor-pointer flex flex-col items-center">
            <img
              src={product.images?.[0]}
              className="w-full h-34 object-contain mb-2 rounded"
            />
            <span className="text-red-500 font-semibold text-sm">
              ₦{product.price.toLocaleString()}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default WeeklyDeals;
