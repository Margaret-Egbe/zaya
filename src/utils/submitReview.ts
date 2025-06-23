import { doc, updateDoc, arrayUnion, Timestamp, serverTimestamp, increment } from "firebase/firestore";
import { db } from "../userAuth/firebase";

interface Review {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export const submitReview = async (productId: string, review: Omit<Review, 'createdAt'>) => {
  const productRef = doc(db, "products", productId);

  
  const serverTime = Timestamp.now(); 

  await updateDoc(productRef, {
    reviews: arrayUnion({
      ...review,
      createdAt: serverTime,  
    }),
    reviewCount: increment(1),
    updatedAt: serverTimestamp(), 
  });

  console.log("✅ Review added successfully");
};
