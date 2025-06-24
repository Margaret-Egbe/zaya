import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../userAuth/firebase";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";


interface Category {
  id: string;
  name: string;
  imageUrl: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "categories"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
      setCategories(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

   if (loading) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 p-3 border rounded shadow-sm">
          <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded bg-gray-200" />
          <Skeleton className="w-16 h-4 bg-gray-200" />
        </div>
      ))}
    </div>
  );
}


  return (
    <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
      {categories.map((category) => (
        <Link to={`/category/${category.name}`} key={category.id}>
          <div className="flex flex-col items-center md:border md:rounded md:p-3 md:shadow md:hover:shadow-lg transition duration-200">
            <img
              src={category.imageUrl}
              alt={category.name}
               loading="lazy"
              className="w-24 h-24 object-contain mb-2 py-4 items-center bg-[#EAEAEA] rounded"
            />
            <span className="text-gray-700 font-medium text-sm">{category.name}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Categories;
