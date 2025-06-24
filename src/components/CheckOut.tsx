import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Ussd from "../assets/ussd.jpeg";
import OpayLogo from "../assets/opay_logo.jpeg";
import GooglePay from "../assets/google-pay-2.svg";
import verve from "../assets/verve.png";
import mastercard from "../assets/mastercard-modern-design-.svg";
import visa from "../assets/visa-10.svg";
import { toast } from "sonner";
import AddressFormDialog from "./AddressFormDialog";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth } from "@/userAuth/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { useCart } from "@/hooks/useCart";
import type { CartItem } from "@/hooks/useCart";
import logo from "../assets/loading_logo.png";
import OpayDialog from "./payments/OpayDialog";
import CheckoutSummary from "./CheckoutSummary";
import UssdDialog from "./payments/UssdDialog";
import CardDialog from "./payments/CardDialog";
import GooglePayDialog from "./payments/GooglePayDialog";

type Address = {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  additionalMobile?: string;
  address: string;
  extraAddress?: string;
  city: string;
  state: string;
  isDefault?: boolean;
};

const paymentMethods = [
  {
    id: "bank",
    name: "Bank Transfer (Opay)",
    icon: <img src={OpayLogo} alt="Opay" className="w-6 h-6" />,
    description: "Transfer directly to our Opay account.",
  },
  {
    id: "ussd",
    name: "USSD",
    icon: <img src={Ussd} alt="USSD" className="w-6 h-6" />,
    description: "Dial a USSD code to make payment.",
  },
  {
    id: "card",
    name: "Credit / Debit Card",
    description: (
      <div className="flex items-center gap-2 mt-1">
        <img
          src={mastercard}
          alt="Mastercard"
          className="w-5 h-5 object-contain"
        />
        <img src={visa} alt="Visa" className="w-5 h-5 object-contain" />
        <img src={verve} alt="Verve" className="w-8 h-5 object-contain" />
      </div>
    ),
  },
  {
    id: "googlepay",
    name: "Google Pay",
    icon: <img src={GooglePay} alt="Google Pay" className="w-9 h-9" />,
  
  },
];

const Checkout = () => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [user] = useAuthState(auth);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [openDialog, setOpenDialog] = useState(false);

  const { cartItems, loading: cartLoading } = useCart();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const deliveryFee = subtotal > 50000 ? 0 : 2500;
  const discount = Number(localStorage.getItem("discount")) || 0;
  const total = subtotal + deliveryFee - discount;
console.debug("Total:", total); // prevents TS warning for unused variable

  const handleConfirm = () => {
    if (!defaultAddress) {
      toast.error(
        "Please add and select a delivery address before proceeding."
      );
      return;
    }

    if (!selectedMethod) {
      toast.error("Please select a payment method!");
      return;
    }
    setShowPaymentDialog(true);
  };

  const fetchAddresses = async () => {
    if (!user) return;
    const ref = collection(db, `users/${user.uid}/addresses`);
    const snapshot = await getDocs(ref);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Address[];
    setAddresses(data);
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const defaultAddress = addresses.find((a) => a.isDefault);

  const handleQuantityChange = async (item: CartItem, delta: number) => {
    if (user) {
      const ref = doc(db, `users/${user.uid}/cart`, item.id);
      const newQty = item.quantity + delta;
      if (newQty < 1) return;
      await updateDoc(ref, { quantity: newQty });
    } else {
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const updatedCart = guestCart.map((c: CartItem) =>
        c.id === item.id
          ? { ...c, quantity: Math.max(1, c.quantity + delta) }
          : c
      );
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("storage")); // to trigger cart update
    }
  };

  if (cartLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img src={logo} alt="Loading..." className="w-16 h-16 animate-bounce" />
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <img
          src={logo}
          alt="Loading..."
          className="w-16 h-16 animate-bounce mb-4"
        />
        <p className="text-gray-500 text-lg">Redirecting.....</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto flex flex-col gap-5 lg:flex-row py-10">
        {/* LEFT: Checkout content spans 2 columns on large screens */}
        <div className="lg:col-span-2 flex-[2] space-y-6 px-4">
          {/* Address Section */}
          <div className="bg-white p-6 rounded-2xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Customer Address
            </h2>
            {addresses.length === 0 ? (
              <span
                className="text-[#A306BD] cursor-pointer hover:underline"
                onClick={() => setOpenDialog(true)}
              >
                + Add Address
              </span>
            ) : (
              <div className="text-sm text-gray-700">
                {defaultAddress ? (
                  <p>
                    <span className="font-semibold">Default: </span>
                    {defaultAddress.address}, {defaultAddress.city},{" "}
                    {defaultAddress.state}
                  </p>
                ) : (
                  <p className="text-gray-500">No default address set.</p>
                )}
                <Button
                  className="mt-3 bg-white border border-[#A306BD] text-[#A306BD] hover:bg-[#F5E9F8] text-sm"
                  onClick={() => setOpenDialog(true)}
                >
                  Change / Add New
                </Button>
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="bg-white p-6 rounded-2xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Confirm Items
            </h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border rounded-lg p-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-contain"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    {item.size && (
                      <p className="text-sm text-gray-500">Size: {item.size}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(item, -1)}
                      >
                        −
                      </Button>
                      <span className="text-sm">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(item, 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-2xl">
            <h2 className="text-2xl mb-6 font-semibold text-gray-800">
              Payment Method
            </h2>
            {selectedMethod ? (
              <div className="flex justify-between items-center border border-[#A306BD] bg-[#FBE9FF] rounded-lg p-4">
                <div className="flex items-center gap-3">
                  {paymentMethods.find((m) => m.name === selectedMethod)?.icon}
                  <p className="font-medium text-gray-800">{selectedMethod}</p>
                </div>
                <button
                  onClick={() => setSelectedMethod(null)}
                  className="text-sm text-[#A306BD] underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.name)}
                    className="flex items-center gap-8 p-4 rounded-lg border border-gray-300 hover:border-[#A306BD] transition"
                  >
                    <span className="w-4 h-4 border-2 rounded-full border-[#A306BD]"></span>
                    <div className="flex items-center gap-3">
                      {method.icon}
                      <div className="text-start">
                        <p className="font-medium text-gray-800">
                          {method.name}
                        </p>
                        <div className="text-sm text-gray-500">
                          {method.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dialogs */}
          <AddressFormDialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            initialData={null}
            onSave={() => {
              fetchAddresses();
              setOpenDialog(false);
            }}
          />
          <OpayDialog
            open={
              showPaymentDialog && selectedMethod === "Bank Transfer (Opay)"
            }
            onClose={() => setShowPaymentDialog(false)}
            cartItems={cartItems}
          />

          <UssdDialog
            open={showPaymentDialog && selectedMethod === "USSD"}
            onClose={() => setShowPaymentDialog(false)}
            cartItems={cartItems}
          />

          <CardDialog
            open={showPaymentDialog && selectedMethod === "Credit / Debit Card"}
            onClose={() => setShowPaymentDialog(false)}
            cartItems={cartItems}
          />

          <GooglePayDialog
            open={showPaymentDialog && selectedMethod === "Google Pay"}
            onClose={() => setShowPaymentDialog(false)}
            cartItems={cartItems}
          />
        </div>

        {/* RIGHT: Checkout Summary */}
        <div className="flex-[1] px-4">
          <CheckoutSummary cartItems={cartItems} onConfirm={handleConfirm} />
        </div>
      </div>
    </>
  );
};

export default Checkout;
