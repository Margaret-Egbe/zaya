import { collection, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../userAuth/firebase";
import { useEffect } from "react";

// First, define a proper Product interface (optional but better practice)
interface Product {
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  description?: string;
  rating?: number;
  soldCount?: number;
  sizes?: string[];
  availableStock?: number;
  discountPercent?: number;
  tags?: string[];
  reviewCount?: number;
  reviews?: any[];
  createdAt?: any;
  updatedAt?: any;
}

// Function to auto-generate dummy description
const generateDescription = (productName: string, category: string): string => {
  return `Introducing the stylish ${productName}, perfect for any ${category.toLowerCase()} lover. Crafted with premium materials for comfort and durability.`;
};

// Function to auto-generate dummy tags based on category
const generateTags = (category: string): string[] => {
  const baseTags: Record<string, string[]> = {
    Sneakers: ["sneakers", "casual", "streetwear", "comfortable"],
    Handbags: ["handbags", "leather", "fashion", "women"],
    Dresses: ["dresses", "fashion", "elegant", "casual"],
    Electronics: ["electronics", "gadgets", "tech", "new"],
  };

  return baseTags[category] || ["fashion", "trendy"];
};

const MigrationPage = () => {
const migrateProducts = async () => {
  const productsRef = collection(db, "products");
  const snapshot = await getDocs(productsRef);

  const updates = snapshot.docs.map(async (docSnap) => {
    const data = docSnap.data() as Product;
    const id = docSnap.id;

    const discountPercent = data.oldPrice
      ? Math.round((1 - data.price / data.oldPrice) * 100)
      : 0;

    const updatedData: Partial<Product> = {
      description: data.description || generateDescription(data.name, data.category),
      rating: data.rating ?? 4.5,
      soldCount: data.soldCount ?? 0,
      sizes: data.sizes ?? ["S", "M", "L"],
      availableStock: data.availableStock ?? 20,
      discountPercent: discountPercent,
      tags: data.tags ?? generateTags(data.category),
      reviewCount: data.reviewCount ?? 0,
      reviews: data.reviews ?? [],
      createdAt: data.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await updateDoc(doc(db, "products", id), updatedData);
    console.log(`✅ Product ${id} updated successfully`);
  });

  await Promise.all(updates);
  console.log("🔥 Migration completed!");

};

  useEffect(() => {
    migrateProducts();
  }, []);

return (
    <div className="p-10">
      <h1>Running Migration...</h1>
    </div>
  );
};
export default MigrationPage;
