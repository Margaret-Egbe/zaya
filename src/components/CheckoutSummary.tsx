import React, { useEffect, useState } from "react";
import type { CartItem } from "@/hooks/useCart";
import { Button } from "./ui/button";

interface Props {
  cartItems: CartItem[];
  onConfirm: () => void;
}

const CheckoutSummary: React.FC<Props> = ({ cartItems, onConfirm }) => {
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Get coupon discount from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("discount");
    if (saved) {
      setCouponDiscount(Number(saved));
    }
  }, []);

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

  const totalDiscount = productDiscount + couponDiscount;
  const deliveryFee = subtotal > 50000 ? 0 : 2500;
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const total = subtotal + deliveryFee - totalDiscount;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full sticky top-24">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

      <div className="space-y-3 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>Items Total ({totalItems})</span>
          <span>₦{subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span>Delivery Fee:</span>
          <span className="text-green-600 font-medium">
            {deliveryFee === 0 ? "Free" : `₦${deliveryFee.toLocaleString()}`}
          </span>
        </div>

        {(productDiscount > 0 || couponDiscount > 0) && (
          <div className="space-y-1 text-[#A306BD] font-medium">
            <div className="flex justify-between">
              <span>Savings:</span>
              <span>-₦{totalDiscount.toLocaleString()}</span>
            </div>
            {productDiscount > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>• From slashed price</span>
                <span>-₦{productDiscount.toLocaleString()}</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>• From coupon</span>
                <span>-₦{couponDiscount.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        <hr className="my-2" />

        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>₦{total.toLocaleString()}</span>
        </div>

        <Button
          onClick={onConfirm}
          className="w-full mt-6 bg-[#A306BD] text-white hover:bg-[#820295]"
        >
          Confirm order
        </Button>
      </div>
    </div>
  );
};

export default CheckoutSummary;
