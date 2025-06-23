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
import visa from "@/assets/visa-10.svg";
import mastercard from "@/assets/mastercard-modern-design-.svg";

interface CardDialogProps {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
}

const formatCardNumber = (value: string) => {
  return value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
};

const detectCardType = (number: string) => {
  if (number.startsWith("4")) return "visa";
  if (number.startsWith("5")) return "mastercard";
  return "default";
};

const CardDialog: React.FC<CardDialogProps> = ({ open, onClose, cartItems }) => {
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    const cleanedNumber = cardNumber.replace(/\s/g, "");
    if (
      cleanedNumber.length !== 16 ||
      !expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/) ||
      cvv.length !== 3
    ) {
      setError("Please enter valid card details.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const orderId = await processOrder(cartItems, "Card");

      setTimeout(() => {
        setLoading(false);
        onClose();
        navigate("/congratulations", { state: { amount: total, orderId } });
      }, 1500);
    } catch (err) {
      console.error("Card payment failed:", err);
      toast.error("Failed to process payment.");
      setLoading(false);
    }
  };

  const cardType = detectCardType(cardNumber.replace(/\s/g, ""));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pay with Credit / Debit Card</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Card number with logo */}
          <div className="relative">
            <input
              type="text"
              maxLength={19}
              placeholder="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              className="w-full border border-gray-300 p-3 pr-12 rounded focus:outline-[#A306BD] font-mono tracking-wider"
              disabled={loading}
            />
            {cardType !== "default" && (
              <img
                src={cardType === "visa" ? visa : mastercard}
                alt="Card Logo"
                className="absolute right-3 top-3 w-10 h-7"
              />
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-1/2 border border-gray-300 p-3 rounded focus:outline-[#A306BD]"
              maxLength={5}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              className="w-1/2 border border-gray-300 p-3 rounded focus:outline-[#A306BD]"
              maxLength={3}
              disabled={loading}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            className="w-full bg-[#A306BD] hover:bg-[#8C059F] text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Processing..." : `Pay ₦${total.toLocaleString()}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardDialog;
