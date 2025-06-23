import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { db } from "../userAuth/firebase";
import { collection, getDocs } from "firebase/firestore";
import Fuse from "fuse.js";

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  images: string[];
  category: string;
  tags?: string[];
}

const SearchPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get("query")?.toLowerCase() || "";

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<number>(0);

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setAllProducts(data);
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Search + filters logic
  useEffect(() => {
    let searchedProducts: Product[] = [...allProducts];

    if (searchTerm) {
      const fuse = new Fuse(allProducts, {
        keys: ["name", "category", "tags"],
        threshold: 0.4,
      });
      const results = fuse.search(searchTerm);
      searchedProducts = results.map((result) => result.item);
    }

    setAvailableCategories(
      Array.from(new Set(searchedProducts.map((p) => p.category)))
    );
    setAvailableTags(
      Array.from(new Set(searchedProducts.flatMap((p) => p.tags || [])))
    );

    let finalFiltered = [...searchedProducts];
    if (selectedCategory !== "All") {
      finalFiltered = finalFiltered.filter(
        (p) => p.category === selectedCategory
      );
    }
    if (selectedTag !== "All") {
      finalFiltered = finalFiltered.filter((p) =>
        p.tags?.includes(selectedTag)
      );
    }
    if (priceRange > 0) {
      finalFiltered = finalFiltered.filter((p) => p.price <= priceRange);
    }

    setFilteredProducts(finalFiltered);
  }, [allProducts, searchTerm, selectedCategory, selectedTag, priceRange]);

  const maxProductPrice = Math.max(...allProducts.map((p) => p.price), 0);
  const capitalizedSearchTerm =
    searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);

  return (
    <div className="py-5 px-4 md:px-10">
      <h2 className="text-lg mb-4 font-semibold">
        {searchTerm ? (
          <>
            Search Results for "
            <span className="font-bold text-red-600">
              {capitalizedSearchTerm}
            </span>
            "
          </>
        ) : (
          "All Products"
        )}
      </h2>

      {/* Filters */}
      <div className="flex md:flex-row flex-nowrap overflow-x-auto gap-4 mb-6 bg-white p-3 px-2">
        <div className="flex-shrink-0">
          <label className="font-semibold">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="ml-2 p-2 border rounded"
          >
            <option value="All">All</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-shrink-0">
          <label className="font-semibold">Tag:</label>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="ml-2 p-2 border rounded"
          >
            <option value="All">All</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-shrink-0">
          <label className="font-semibold">Max Price:</label>
          <input
            type="range"
            min="0"
            max={maxProductPrice}
            step="5000"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="ml-2"
            style={{
              WebkitAppearance: "none",
              appearance: "none",
              height: "8px",
              borderRadius: "9999px",
              background: "#E3B6ED",
              outline: "none",
              transition: "background 0.3s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#D197E7")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#E3B6ED")}
          />
          <style>{`
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              height: 20px;
              width: 20px;
              border-radius: 50%;
              background: #A306BD;
              cursor: pointer;
              box-shadow: 0 0 2px rgba(0,0,0,0.5);
              transition: transform 0.2s ease;
            }
            input[type="range"]::-webkit-slider-thumb:hover {
              transform: scale(1.2);
            }
            input[type="range"]::-moz-range-thumb {
              height: 20px;
              width: 20px;
              border-radius: 50%;
              background: #A306BD;
              cursor: pointer;
              box-shadow: 0 0 2px rgba(0,0,0,0.5);
              transition: transform 0.2s ease;
            }
            input[type="range"]::-moz-range-thumb:hover {
              transform: scale(1.2);
            }
          `}</style>

          <span className="ml-2 font-semibold text-sm">
            ₦{priceRange.toLocaleString()}
          </span>
        </div>

        <div className="flex-shrink-0">
          <span
            onClick={() => {
              setSelectedCategory("All");
              setSelectedTag("All");
              setPriceRange(0);
            }}
            className=" text-red-600 underline font-medium px-2 py-1 rounded ml-2 text-sm cursor-pointer"
          >
            Clear Filters
          </span>
        </div>
      </div>

      {/* Product Display */}
      {loading ? (
        <div>Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id}>
              <div className="bg-white p-4 rounded shadow">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-32 object-contain mb-2 rounded"
                />
                <h4 className="font-bold text-sm line-clamp-1">
                  {product.name}
                </h4>
                <div className="flex items-center">
                  <span className="font-semibold text-sm">
                    ₦{product.price.toLocaleString()}
                  </span>
                  {product.oldPrice && (
                    <span className="text-gray-500 text-sm line-through ml-2">
                      ₦{product.oldPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
