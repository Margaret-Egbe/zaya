import React, { useEffect, useState } from "react";
import { db } from "../userAuth/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { toast } from "sonner";
import { generateProductData } from "@/utils/generateProductData";

const UploadProduct: React.FC = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [oldPrice, setOldPrice] = useState<number | null>(null);
  const [sizes, setSizes] = useState<string[]>([]);
  const shirtSizes = ["Small", "Medium", "Large", "Extra Large"];
  const [images, setImages] = useState<string[]>([]);
  const [currentImage, setCurrentImage] = useState("");

  const [isSuperDeal, setIsSuperDeal] = useState(false);
  const [isWeeklyDeals, setIsWeeklyDeals] = useState(false);
  const [isFreeDelivery, setIsFreeDelivery] = useState(false);
  const [isExplore, setIsExplore] = useState(false);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [soldCount, setSoldCount] = useState(0);
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddSize = (size: string) => {
    if (size && !sizes.includes(size)) {
      setSizes([...sizes, size]);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategories(data);
    };

    fetchCategories();
  }, []);

  const handleAddImage = () => {
    if (currentImage) {
      setImages([...images, currentImage]);
      setCurrentImage("");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    console.log("✅ handleUpload function was called");
    setSuccess(null);

    if (!name || !price || images.length === 0 ) {
      toast("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      // ✅ convert features string to array here before passing
      const featuresArray = features
        .split("\n")
        .map((f: string) => f.trim())
        .filter((f: string) => f.length > 0);

      const productInput = {
        name,
        price,
        oldPrice,
        sizes,
        images,
        category,
        rating: rating ?? undefined, // normalize rating for ProductInput type
        soldCount,
        description,
        features: featuresArray,
        isSuperDeal,
        isFreeDelivery,
        isWeeklyDeals,
        isExplore,
      };

      const fullProductData = generateProductData(productInput);
      console.log("This is what I'm uploading:", fullProductData);

      await addDoc(collection(db, "products"), fullProductData);

      // Reset form after successful upload
      setName("");
      setPrice(0);
      setOldPrice(null);
      setSizes([]);
      setImages([]);
      setCategory("");
      setRating(4);
      setSoldCount(0);
      setDescription("");
      setFeatures("");
      setIsSuperDeal(false);
      setIsFreeDelivery(false);
      setIsWeeklyDeals(false);
      setIsExplore(false);
      toast.success("Product uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleUpload}
      className="flex flex-col gap-2 max-w-md mx-auto p-4 mb-4 mt-6 border rounded shadow-md "
    >
      <h2 className="text-xl font-semibold mb-2">Upload Product</h2>

      <input
        type="text"
        value={name}
        placeholder="Product name"
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="number"
        value={price}
        placeholder="Price"
        onChange={(e) => setPrice(+e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="number"
        value={oldPrice || ""}
        placeholder="Old Price (optional)"
        onChange={(e) => setOldPrice(e.target.value ? +e.target.value : null)}
        className="border p-2 rounded"
      />

      {/* Dynamic Sizes */}
      {category === "Shirts" && (
        <div>
          <label className="font-semibold">Select Shirt Size:</label>
          <select
            className="border p-2 rounded mt-1"
            onChange={(e) => handleAddSize(e.target.value)}
          >
            <option value="">Select Shirt Size</option>
            {shirtSizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {sizes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {sizes.map((s) => (
                <div
                  key={s}
                  className="bg-blue-200 text-blue-700 px-3 py-1 rounded"
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sneakers, fans, bags, etc → manual sizes */}
      {category !== "Shirts" && (
        <div className="w-full">
          <label className="font-semibold">Enter Sizes (comma separated)</label>
          <input
            type="text"
            placeholder="e.g 38,39,40,41"
            onChange={(e) =>
              setSizes(e.target.value.split(",").map((s) => s.trim()))
            }
            className="border p-2 rounded mt-1"
          />
        </div>
      )}

      <input
        type="text"
        value={currentImage}
        placeholder="Image URL"
        onChange={(e) => setCurrentImage(e.target.value)}
        className="border p-2 rounded"
      />
      <button
        type="button"
        onClick={handleAddImage}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        Add Image
      </button>

      <div className="flex flex-wrap gap-2">
        {images.map((img, i) => (
          <div key={i} className="bg-gray-200 p-1 rounded">
            {img}
          </div>
        ))}
      </div>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        value={rating || ""}
        placeholder="Rating (e.g. 4.5)"
        step="0.1"
        min="0"
        max="5"
        onChange={(e) => setRating(e.target.value ? +e.target.value : null)}
        className="border p-2 rounded"
      />

      <input
        type="number"
        value={soldCount}
        placeholder="Sold count"
        onChange={(e) => setSoldCount(+e.target.value)}
        className="border p-2 rounded"
      />

      <textarea
        value={description}
        placeholder="Product Description"
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 rounded"
      ></textarea>

      <textarea
        value={features}
        placeholder="Product Features"
        onChange={(e) => setFeatures(e.target.value)}
        className="border p-2 rounded"
      ></textarea>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isSuperDeal}
          onChange={(e) => setIsSuperDeal(e.target.checked)}
        />
        Super Deal
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isFreeDelivery}
          onChange={(e) => setIsFreeDelivery(e.target.checked)}
        />
        Free Delivery Product
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isWeeklyDeals}
          onChange={(e) => setIsWeeklyDeals(e.target.checked)}
        />
        Weekly Deals Product
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isExplore}
          onChange={(e) => setIsExplore(e.target.checked)}
        />
        Explore Product
      </label>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload Product"}
      </button>

      {success && <p className="text-green-600">{success}</p>}
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
};

export default UploadProduct;
