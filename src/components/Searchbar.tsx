import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import debounce from "debounce";
import { db } from "../userAuth/firebase";
import { collection, getDocs } from "firebase/firestore";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Button } from "./ui/button";
import InsightsIcon from "@mui/icons-material/Insights";

interface Product {
  id: string;
  name: string;
  category: string;
  tags?: string[];
}

const Searchbar: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      setProducts(data);
      generatePopularSearches(data);
    };
    fetchProducts();
  }, []);

  // Generate popular searches based on products
  const generatePopularSearches = (products: Product[]) => {
    const terms = [
      ...products.map((p) => p.category),
      ...products.map((p) => p.name),
    ];
    const countMap: Record<string, number> = {};
    terms.forEach((term) => {
      if (term) countMap[term] = (countMap[term] || 0) + 1;
    });
    const sorted = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .map(([term]) => term);
    setPopularSearches(sorted.slice(0, 10));
  };

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) setRecentSearches(JSON.parse(stored));
  }, []);

  // Debounced search
  const debouncedFilter = useCallback(
    debounce((text: string) => {
      setLoading(true);
      if (text.trim() === "") {
        setSuggestions([]);
        setLoading(false);
        return;
      }
      const lowerText = text.toLowerCase();
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerText) ||
          product.category.toLowerCase().includes(lowerText) ||
          (product.tags &&
            product.tags.some((tag) => tag.toLowerCase().includes(lowerText)))
      );
      setSuggestions(filtered.slice(0, 5));
      setLoading(false);
      setShowDropdown(true);
    }, 300),
    [products]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setShowDropdown(true);
    debouncedFilter(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?query=${query}`);
      setShowDropdown(false);

      // Save to recent searches
      setRecentSearches((prev) => {
        const updated = [query, ...prev.filter((s) => s !== query)].slice(0, 5);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleQuickSearch = (term: string) => {
    navigate(`/search?query=${term}`);
    setShowDropdown(false);
  };

  const handleSuggestionClick = (product: Product) => {
    navigate(`/product/${product.id}`);
    setShowDropdown(false);
    setQuery("");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex w-full max-w-[600px]  gap-4"
    >
      <div className="flex items-center flex-grow px-4 py-2 bg-white border border-black rounded-full shadow-sm focus-within:ring-0">
        <SearchOutlinedIcon className="text-gray-500 mr-3" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for products or category..."
          className="w-full bg-transparent outline-none placeholder-black text-black"
          onFocus={() => setShowDropdown(true)}
        />
      </div>

      <Button
        className="px-6 whitespace-nowrap bg-[#A306BD] text-white py-3 rounded-lg hover:bg-[#8C059F]
                transition duration-200 cursor-pointer hidden md:flex"
      >
        Search
      </Button>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full z-10 bg-white border rounded-lg shadow-lg transition-all duration-200 ease-in-out"
        >
          {query.trim() === "" ? (
            <div className="p-4">
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-700">
                      Recent Searches
                    </h4>
                    <button
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem("recentSearches");
                      }}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleQuickSearch(term)}
                        className="px-3 py-1 bg-[#f5f5f5] text-gray-700 hover:bg-transition cursor-pointer items-center hover:bg-[#e0e0e0] transition duration-200 text-sm border"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-700 mb-2">
                  Popular Searches
                </h4>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <Button
                      key={term}
                      onClick={() => handleQuickSearch(term)}
                      className="px-3 py-1 bg-[#f5f5f5] text-gray-700 hover:bg-transition flex gap-3 cursor-pointer items-center hover:bg-[#e0e0e0] transition duration-200 text-sm border"
                    >
                      <InsightsIcon fontSize="small" className="text-inherit" />
                      {term}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {loading ? (
                <div className="p-3 text-gray-500">Loading...</div>
              ) : suggestions.length > 0 ? (
                suggestions.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className="p-3 hover:bg-[#F3F4F6] cursor-pointer transition"
                  >
                    {product.name}
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500">No results found.</div>
              )}
            </div>
          )}
        </div>
      )}
    </form>
  );
};

export default Searchbar;
