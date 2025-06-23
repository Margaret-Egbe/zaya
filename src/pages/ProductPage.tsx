import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../userAuth/firebase";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/userAuth/firebase";
import { FaStar} from "react-icons/fa";
import ReviewForm from "@/utils/ReviewForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import logo from "../assets/loading_logo.png";
import YouMayAlsoLike from "@/components/YouMayAlsoLike";
import WishlistHeart from "@/components/WishlistHeart";

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  sizes?: string[];
  images: string[];
  rating?: number;
  soldCount?: number;
  description?: string;
  features?: string[];
  availableStock?: number;
  discountPercent?: number;
  tags?: string[];
  reviewCount?: number;
  reviews?: any[];
  createdAt?: any;
  updatedAt?: any;
  category?: string;
}

type ViewedProduct = {
  id: string;
  name: string;
  image: string;
  price: number;
};

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const { id: productIdFromRoute } = useParams();

  
  
  // Saved items logic
  useEffect(() => {
    if (!productId) return;

    setLoading(true);

    const unsubscribe = onSnapshot(
      doc(db, "products", productId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Omit<Product, "id">;
          setProduct({ id: docSnap.id, ...data });
          setActiveImage(data.images?.[0] ?? "");
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [productId]);

  
  
  


  // Add to cart logic
  const handleAddToCart = async () => {
    if (!product) return;

    if (product.sizes?.length && !selectedSize) {
      setSizeError("Please select a size.");
      return;
    }

    const selectedImage = activeImage || product?.images[0];

    const newItem = {
      id: product?.id,
      name: product?.name,
      price: product?.price,
      oldPrice: product.oldPrice || null,
      image: selectedImage,
      size: selectedSize ?? null,
      quantity: 1,
    };

    if (!user) {
      // GUEST CART
      const existingCart = JSON.parse(
        localStorage.getItem("guestCart") || "[]"
      );
      const index = existingCart.findIndex(
        (item: any) => item.id === newItem.id
      );

      if (index !== -1) {
        existingCart[index].quantity += 1;
      } else {
        existingCart.push(newItem);
      }

      localStorage.setItem("guestCart", JSON.stringify(existingCart));
      toast.success("Product added to cart!");
      return;
    }

    // AUTHENTICATED USER CART
    const cartRef = doc(db, "users", user.uid, "cart", product.id);
    const docSnap = await getDoc(cartRef);

    try {
      if (docSnap.exists()) {
        const currentQty = docSnap.data().quantity || 1;
        await setDoc(cartRef, {
          ...docSnap.data(),
          quantity: currentQty + 1,
          image: selectedImage,
        });
      } else {
        await setDoc(cartRef, {
          name: product.name,
          price: product.price,
          oldPrice: product.oldPrice || null,
          image: selectedImage,
          size: selectedSize ?? null,
          quantity: 1,
          timestamp: serverTimestamp(),
        });
      }

      toast.success("Product added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  // Recentlyviewed logic
  useEffect(() => {
    const addToRecentlyViewed = async () => {
      if (!product?.id || !product?.name || !product?.images) return;

      const productData: ViewedProduct = {
        id: product.id,
        name: product.name,
        image: product.images?.[0] || "",

        price: product.price,
      };

      if (user) {
        await setDoc(
          doc(db, "users", user.uid, "recentlyViewed", product.id),
          productData
        );
      } else {
        const stored = localStorage.getItem("recentlyViewed");
        let updated: ViewedProduct[] = stored ? JSON.parse(stored) : [];

        updated = [
          productData,
          ...updated.filter((p) => p.id !== product.id),
        ].slice(0, 10);

        localStorage.setItem("recentlyViewed", JSON.stringify(updated));
      }
    };

    addToRecentlyViewed();
  }, [product, user]);

  // You may also like logic
  useEffect(() => {
    if (!productIdFromRoute) return;

    const fetchProduct = async () => {
      const docRef = doc(db, "products", productIdFromRoute);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
      }
    };

    fetchProduct();
  }, [productIdFromRoute]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img src={logo} alt="Loading..." className="w-16 h-16 animate-bounce" />
      </div>
    );
  }

  if (!product) return <p className="text-center mt-20">Product not found.</p>;

  const handleWriteReview = () => {
    if (!user) {
      navigate("/signin");
    } else {
      setShowReviewForm(true);
    }
  };

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    setSizeError(null); // clears the error
  };

  return (
    <>
      <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Left Side - Image Gallery */}
          <div className="w-full md:w-1/2">
            <div className="relative">
              <img
                src={activeImage ?? product.images[0]}
                alt={product.name}
                className="w-full h-[500px] object-contain rounded-lg border"
              />
               <WishlistHeart product={product} />
            
            </div>

            {/* Thumbnail Gallery */}
            {product.images?.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Product thumbnail ${idx}`}
                    onClick={() => setActiveImage(img)}
                    className={`w-24 h-24 object-cover rounded border cursor-pointer 
          ${
            activeImage === img
              ? "border-[#A306BD] border-2"
              : "border-gray-300"
          }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Product Info */}
          <div className="w-full md:w-1/2 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              {/* Newprice & Oldprice*/}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-green-600">
                  ₦{product.price.toLocaleString()}
                </span>
                {product.oldPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ₦{product.oldPrice.toLocaleString()}
                  </span>
                )}
                {/* DiscountPercent */}
                {product.discountPercent && (
                  <p className="text-sm text-white bg-[#E974FB] rounded-sm p-1">
                    -{product.discountPercent}% Off!
                  </p>
                )}
              </div>

              {/* AvailableStock */}
              {product.availableStock && (
                <p className="text-sm text-gray-600 mb-2">
                  Stock Available: {product.availableStock} pieces
                </p>
              )}

              {/* Review & soldCount*/}
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
                {/* ReviewCount */}
                <span className="ml-2">
                  | {product.reviewCount ?? 0} Reviews
                </span>
              </div>

              {/* Size selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-4 mb-7">
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">
                    Select Size:
                  </h3>
                  <div className="flex gap-3 flex-wrap mb-4">
                    {product.sizes.map((size, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSize(size)}
                        className={`px-4 py-2 border rounded cursor-pointer 
                        ${
                          selectedSize === size
                            ? "bg-[#A306BD] text-white border-[#DB20F8]"
                            : "bg-white text-gray-700 border-gray-300"
                        }
                        hover:border-[#DB20F8] transition`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {sizeError && (
                <p className="text-red-500 text-sm mt-1">{sizeError}</p>
              )}

              {/* Description */}
              <h1 className="font-bold text-lg mb-4 mt-5">Description</h1>
              {product.description && (
                <p className="text-gray-700 mb-4 ">{product.description}</p>
              )}

              {/* features */}
              <h1 className="font-bold text-lg mb-4">Features</h1>
              {Array.isArray(product.features) &&
                product.features.map((item, idx) => <li key={idx}>{item}</li>)}
            </div>

            {/* Add to Cart Button */}
            <div className="sticky bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 bg-white w-full px-1 flex flex-col py-3 rounded-lg md:static mt-5">
              <Button
                onClick={handleAddToCart}
                className="bg-[#A306BD] text-white py-3 rounded-lg hover:bg-[#8C059F]"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Review Product CTA */}
      <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-lg">
        {/* Reviews */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-10 border-t ">
            <h3 className="text-lg font-semibold mb-2 pt-5">Reviews:</h3>
            <div className="space-y-4">
              {product.reviews.map((review, index) => (
                <div key={index} className="p-4 border rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{review.userName}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <FaStar
                          key={i}
                          className={`mr-1 ${
                            i < review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{review.comment}</p>
                  <p className="text-xs text-gray-400">
                    {review.createdAt?.toDate().toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 mt-15">
          <h3 className="font-semibold text-lg mb-2">Review this product</h3>
          <p className="text-sm text-gray-600 mb-4">
            Share your thoughts with other customers
          </p>

          <Button
            variant="outline"
            className="text-[#A306BD] px-2 py-1 focus:outline-none border-purple-400 rounded cursor-pointer"
            onClick={handleWriteReview}
          >
            Write a customer review
          </Button>
        </div>
        {showReviewForm && <ReviewForm />}
      </div>

      <div className="mt-20">
        {product && (
          <YouMayAlsoLike
            currentProductId={product.id}
            category={(product as any).category}
          />
        )}
      </div>
    </>
  );
};

export default ProductPage;
