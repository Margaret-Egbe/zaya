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

interface OpayDialogProps {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
}

const OpayDialog: React.FC<OpayDialogProps> = ({ open, onClose, cartItems }) => {
  const [accountNumber, setAccountNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Calculate all totals
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

  const handleSubmit = async () => {
    if (!accountNumber.trim() || accountNumber.length !== 10) {
      setError("Please enter a valid 10-digit Opay account number.");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const orderId = await processOrder(cartItems, "Opay");

      setTimeout(() => {
        setLoading(false);
        onClose();
        navigate("/congratulations", { state: { amount: total, orderId } });
      }, 1500);
    } catch (err) {
      console.error("Order failed:", err);
      toast.error("Failed to process order. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Opay Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-700">
            Enter your Opay account number. A total of{" "}
            <strong>₦{total.toLocaleString()}</strong> will be deducted from
            your Opay wallet.
          </p>

          <input
            type="text"
            placeholder="Enter Opay account number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
            disabled={loading}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            className="w-full hover:bg-[#8C059F] bg-[#A306BD] cursor-pointer text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Processing Payment..." : "Pay Now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OpayDialog;
