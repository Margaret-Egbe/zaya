import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { submitReview } from "@/utils/submitReview";
import { toast } from "sonner";
import { auth } from "@/userAuth/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ReviewForm: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to submit a review.");
      navigate("/signup");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please enter a comment.");
      return;
    }

    setSubmitting(true);

    const review = {
      userId: user.uid,
      userName: user?.displayName || "Anonymous",
      rating,
      comment,
      createdAt: Timestamp.now(),
    };

    try {
      await submitReview(productId!, review);
      toast.success("Review submitted!");
      setComment("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 p-4 border rounded">
      <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>

      <div className="mb-4">
        <label className="block mb-2">Rating</label>
        <select
          className="border p-2 w-full"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} Stars
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Comment</label>
        <textarea
          className="border p-2 w-full"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <Button
        variant="secondary"
        className=" text-white px-4  py-1 bg-[#A306BD]  rounded hover:bg-[#8C059F]
                transition duration-200 cursor-pointer"
        type="submit"
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
};

export default ReviewForm;
