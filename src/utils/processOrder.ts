import {
  collection,
  doc,
  getDoc,
  updateDoc,
  getDocs,
  deleteDoc,
  addDoc,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "@/userAuth/firebase";
import emailjs from "@emailjs/browser";
import type { CartItem } from "@/hooks/useCart";

export async function processOrder(
  cartItems: CartItem[],
  paymentMethod: string
) {
  const user = auth.currentUser;

  // 1. Update sold count for each product
  for (const item of cartItems) {
    const productRef = doc(db, "products", item.id);
    const productSnap = await getDoc(productRef);
    const currentSold = productSnap.data()?.soldCount || 0;
    await updateDoc(productRef, {
      soldCount: currentSold + item.quantity,
    });
  }

  // 2. Calculate subtotal (actual prices)
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 3. Calculate product discount (old price - current price)
  const productDiscount = cartItems.reduce((sum, item) => {
    if (item.oldPrice && item.oldPrice > item.price) {
      return sum + (item.oldPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);

  // 4. Get coupon discount from localStorage
  const couponDiscount = Number(localStorage.getItem("discount") || "0");

  // 5. Total discount = product discount + coupon
  const totalDiscount = productDiscount + couponDiscount;

  // 6. Calculate delivery fee
  const deliveryFee = subtotal > 50000 ? 0 : 2500;

  // 7. Calculate total
  const total = subtotal + deliveryFee - totalDiscount;

  // 8. Generate email HTML
  const orderHtml = `
  <div style="font-family: Arial, sans-serif; padding: 10px;">
    <h2 style="color: #A306BD;">🛍️ Order Summary</h2>
    ${cartItems
      .map(
        (item) => `
        <div style="display: flex; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 12px;">
          <img src="${item.image}" alt="${
          item.name
        }" width="50" height="50" style="border-radius: 6px; margin-right: 16px; object-fit: contain;" />
          <div>
            <p style="margin: 0; font-weight: bold; font-size: 15px;">${
              item.name
            }</p>
            <p style="margin: 2px 0; color: #555;">Qty: ${item.quantity}</p>
            ${
              item.size
                ? `<p style="margin: 2px 0; color: #555;">Size: ${item.size}</p>`
                : ""
            }
            <p style="margin: 2px 0; color: #333;">
              ₦${(item.price * item.quantity).toLocaleString()}
            </p>
          </div>
        </div>
      `
      )
      .join("")}

    <hr style="margin: 20px 0;" />

    <p style="font-size: 15px; margin: 4px 0;"><strong>Delivery Fee:</strong> ₦${deliveryFee.toLocaleString()}</p>
    <p style="font-size: 15px; margin: 4px 0;"><strong>Discount:</strong> ₦${totalDiscount.toLocaleString()}</p>
    <p style="font-size: 15px; margin: 4px 0;"><strong>Total:</strong> ₦${total.toLocaleString()}</p>

    <p style="margin-top: 24px; font-size: 14px; color: #888;">
      Thank you for shopping with Zaya 💜
    </p>
  </div>
  `;

  // 9. Save order to Firestore
  const orderData = {
    userId: user ? user.uid : "guest",
    email: user?.email || "guest@zaya.com",
    items: cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      oldPrice: item.oldPrice,
      subtotal,
      size: item.size || null,
      image: item.image,
    })),
    total,
    subtotal,
    deliveryFee,
    productDiscount,
    couponDiscount,
    discount: totalDiscount,
    paymentMethod,
    date: Timestamp.now(),
    status: "Pending",
  };

  const orderRef = await addDoc(collection(db, "orders"), orderData);
  const orderId = orderRef.id;
  // 🔁 Also save to user's personal orders for OrderHistory page
  if (user) {
    await setDoc(doc(db, `users/${user.uid}/orders/${orderId}`), orderData);
  }

  // 10. Send confirmation email
  await emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    {
      order_id: orderId,
      to_email: orderData.email,
      user_name: user?.displayName || "Guest",
      payment_method: paymentMethod,
      order_summary_html: orderHtml,
    },
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  );

  // 11. Clear cart
  if (user) {
    const cartRef = collection(db, `users/${user.uid}/cart`);
    const cartSnap = await getDocs(cartRef);
    const deletePromises = cartSnap.docs.map((docSnap) =>
      deleteDoc(doc(db, `users/${user.uid}/cart`, docSnap.id))
    );
    await Promise.all(deletePromises);
  } else {
    localStorage.removeItem("guestCart");
    window.dispatchEvent(new Event("storage"));
  }

  return orderId;
}
