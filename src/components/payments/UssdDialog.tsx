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

interface UssdDialogProps {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
}

const UssdDialog: React.FC<UssdDialogProps> = ({ open, onClose, cartItems }) => {
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

  const handleConfirmPayment = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const orderId = await processOrder(cartItems, "USSD");

      setTimeout(() => {
        setLoading(false);
        onClose();
        navigate("/congratulations", { state: { amount: total, orderId } });
      }, 1500);
    } catch (err) {
      console.error("USSD Payment failed:", err);
      toast.error("Failed to process order. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay with USSD</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-700">
            Dial the following USSD code on your phone to complete the payment:
          </p>

          <div className="bg-gray-100 text-center p-3 rounded text-lg font-semibold text-purple-700">
            *955*000*{total.toLocaleString()}#
          </div>

          <p className="text-sm text-gray-500">
            After completing the payment on your phone, click the button below to confirm.
          </p>

          <Button
            className="w-full hover:bg-[#8C059F] bg-[#A306BD] cursor-pointer text-white"
            onClick={handleConfirmPayment}
            disabled={loading}
          >
            {loading ? "Verifying Payment..." : "I Have Paid"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UssdDialog;
