import { serverTimestamp } from "firebase/firestore";

// Optional: strongly typed interface (can reuse across your project)
interface ProductInput {
  name: string;
  price: number;
  oldPrice?: number | null;
  sizes: string[];
  images: string[];
  category: string;
  rating?: number;
  soldCount?: number;
  description?: string;
  features?: string[];
  isSuperDeal?: boolean;
  isFreeDelivery?: boolean;
  isWeeklyDeals?: boolean;
  isExplore?: boolean;
}

export const generateTags = (category: string): string[] => {
  const baseTags: Record<string, string[]> = {
    Sneakers: ["sneakers", "casual", "streetwear", "comfortable"],
    Handbags: ["handbags", "leather", "fashion", "women"],
    Dresses: ["dresses", "fashion", "elegant", "casual"],
    Electronics: ["electronics", "gadgets", "tech", "new"],
    Shirts: ["shirts", "fashion", "apparel", "men", "women"],
    Fans: ["fans", "electronics", "cooling", "appliances"],
    Laptops: ["laptops", "computers", "tech", "gadgets"],
  };
  return baseTags[category] || ["fashion", "trendy"];
};

export const generateProductData = (input: ProductInput) => {
  const discountPercent = input.oldPrice
    ? Math.round((1 - input.price / input.oldPrice) * 100)
    : 0;

  return {
    ...input,
    oldPrice: input.oldPrice || null,
    rating: input.rating || 4.5,
    soldCount: input.soldCount || 0,
    description: input.description || `Introducing ${input.name}, perfect for every ${input.category} lover.`,
     features: input.features || [], 
   isSuperDeal: input.isSuperDeal || false,
    isFreeDelivery: input.isFreeDelivery || false,
    isWeeklyDeals: input.isWeeklyDeals || false,
    isExplore: input.isExplore || false,
    discountPercent,
    availableStock: 20,
    reviewCount: 0,
    reviews: [],
    tags: generateTags(input.category),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
};
