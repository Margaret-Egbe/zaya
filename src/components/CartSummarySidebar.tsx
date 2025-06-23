import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FaTruck } from "react-icons/fa";
import { Tag } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  total: number; // Actual subtotal (price * quantity)
  productDiscount?: number; // Optional: slashed price discount
}

const CartSummarySidebar: React.FC<Props> = ({ total, productDiscount = 0 }) => {
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);

  const deliveryFee = total > 50000 ? 0 : 2500;

  const validCoupons: Record<string, number> = {
    ZAYA1000: 1000,
    FREEDELIVERY: deliveryFee,
    ZAYA50K: total >= 50000 ? 5000 : 0,
  };

  const totalDiscount = productDiscount + couponDiscount;
  const estimatedTotal = total + deliveryFee - totalDiscount;

  // Restore saved coupon
  useEffect(() => {
    const savedCoupon = localStorage.getItem("coupon");
    const savedDiscount = localStorage.getItem("discount");
    if (savedCoupon && savedDiscount) {
      setCoupon(savedCoupon);
      setCouponDiscount(Number(savedDiscount));
    }
  }, []);

  const applyCoupon = () => {
    const input = coupon.toUpperCase();
    const discount = validCoupons[input];

    if (discount) {
      setCouponDiscount(discount);
      setCouponError("");
      localStorage.setItem("coupon", input);
      localStorage.setItem("discount", discount.toString());
    } else {
      setCouponError("Invalid or inapplicable coupon code.");
      setCouponDiscount(0);
      localStorage.removeItem("coupon");
      localStorage.removeItem("discount");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full lg:max-w-sm sticky top-24">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

      <div className="space-y-3 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₦{total.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span>Delivery:</span>
          <span className="text-green-600 font-medium">
            {deliveryFee === 0 ? "Free" : `₦${deliveryFee.toLocaleString()}`}
          </span>
        </div>

        {totalDiscount > 0 && (
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
          <span>₦{estimatedTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Coupon Section */}
      <div className="mt-6">
        <label htmlFor="coupon" className="text-sm font-medium">
          Have a coupon?
        </label>
        <input
          id="coupon"
          type="text"
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#A306BD]"
          placeholder="Enter code e.g. ZAYA1000"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
        />
        {couponError && (
          <p className="text-red-500 text-xs mt-1">{couponError}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Try: ZAYA1000, FREEDELIVERY, ZAYA50K
        </p>

        <Button
          className="w-full mt-3 bg-white border border-[#A306BD] text-[#A306BD] hover:bg-[#F5E9F8] text-sm flex items-center justify-center gap-2 cursor-pointer"
          onClick={applyCoupon}
        >
          <Tag className="w-4 h-4" />
          Apply Coupon
        </Button>
      </div>

      <Link to="/checkout">
        <Button className="w-full mt-6 bg-[#A306BD] text-white hover:bg-[#820295]">
          Proceed to Checkout
        </Button>
      </Link>

      <div className="flex items-center justify-center mt-4 text-xs text-gray-500">
        <FaTruck className="mr-2 text-[#A306BD]" />
        Estimated delivery in 2–4 days
      </div>
    </div>
  );
};

export default CartSummarySidebar;
