import { useEffect, useState } from "react";

export const useCartTotal = () => {
  const [total, setTotal] = useState(0);
  const [savings, setSavings] = useState(0);

  useEffect(() => {
    const userCart = localStorage.getItem("guestCart");
    const cartItems = userCart ? JSON.parse(userCart) : [];

    const totalAmount = cartItems.reduce((acc: number, item: any) => {
      return acc + item.price * item.quantity;
    }, 0);

    // Optional: fake savings, e.g. 10% off over ₦30,000
    const fakeSavings = totalAmount > 30000 ? Math.floor(totalAmount * 0.1) : 0;

    setTotal(totalAmount);
    setSavings(fakeSavings);
  }, []);

  return { total, savings };
};
