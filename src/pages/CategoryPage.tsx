import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../userAuth/firebase";
import { FaStar, FaRegHeart } from "react-icons/fa";
import logo from "../assets/loading_logo.png"; 

interface Product {
  id: string;
  name: string;
  images?: string[];
  price: number;
  oldPrice?: number;
  rating?: number;
  soldCount?: number;
  sizes?: string[];
}

const CategoryPage: React.FC = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("category", "==", categoryName)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      setProducts(data as Product[]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [categoryName]);

  
   if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <img src={logo} alt="Loading..." className="w-16 h-16 animate-bounce" />
        </div>
      );
    }

  return (
    <div className="w-full bg-white py-10">
      <div className="max-w-5xl mx-auto  px-4 bg-white">
        <h1 className="text-2xl font-semibold mb-6">
          {categoryName?.toUpperCase()}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3  lg:grid-cols-4 gap-3 ">
          {products.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`}>
              <div className="border rounded shadow p-3 relative">
                <div className="absolute top-2 right-2 text-red-400 text-xl cursor-pointer">
                  <FaRegHeart />
                </div>

                <img
                  src={
                    product.images && product.images.length > 0
                      ? product.images[0]
                      : "/placeholder.png"
                  }
                  alt={product.name}
                  className="w-full h-32 object-contain mb-2"
                />

                <h2 className="font-medium line-clamp-2">{product.name}</h2>
                <p className="text-blue-600 font-semibold">₦{product.price}</p>

                <div className="flex items-center text-gray-500 my-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FaStar
                      key={i}
                      className={`mr-1 ${
                        i < Math.round(product.rating || 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2">| {product.soldCount || 0} sold</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
