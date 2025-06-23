import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { processOrder } from "@/utils/processOrder";
import { toast } from "sonner";
import type { CartItem } from "@/hooks/useCart";
import googlepay from "@/assets/google-pay-2.svg"; 

interface GooglePayDialogProps {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
}

const GooglePayDialog: React.FC<GooglePayDialogProps> = ({
  open,
  onClose,
  cartItems,
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const productDiscount = cartItems.reduce((sum, item) => {
    if (item.oldPrice && item.oldPrice > item.price) {
      return sum + (item.oldPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);
  const couponDiscount = Number(localStorage.getItem("discount")) || 0;
  const deliveryFee = subtotal > 50000 ? 0 : 2500;
  const total = subtotal + deliveryFee - (productDiscount + couponDiscount);

  const handlePayment = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setLoading(true);
    try {
      const orderId = await processOrder(cartItems, "Google Pay");

      setTimeout(() => {
        setLoading(false);
        onClose();
        navigate("/congratulations", { state: { amount: total, orderId } });
      }, 1500);
    } catch (err) {
      console.error("Google Pay failed:", err);
      toast.error("Payment failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pay with Google Pay</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-center">
          <img
            src={googlepay}
            alt="Google Pay"
            className="w-28 h-10 mx-auto object-contain"
          />

          <p className="text-gray-700">
            You're about to pay <strong>₦{total.toLocaleString()}</strong> using your linked
            cards and accounts via Google Pay.
          </p>

          <Button
            className="w-full bg-[#4285F4] hover:bg-[#3367D6] text-white text-base font-medium"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? "Processing..." : "Pay with Google Pay"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GooglePayDialog;
