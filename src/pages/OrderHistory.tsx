import { useEffect, useState } from "react";
import { auth, db } from "@/userAuth/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, orderBy } from "firebase/firestore";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import OrderDetailsDialog from "@/components/OrderDetailsDialog";
import StatusBadge from "@/components/StatusBadge";
import { onSnapshot } from "firebase/firestore"; 
import logo from "../assets/loading_logo.png";

interface OrderItem {
  id: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  paymentMethod: string;
  date: any;
  status: string;
  couponDiscount?: number;
  productDiscount?: number;
  shippingAddress?: {
    fullName?: string;
    phoneNumber?: string;
    addressLine1?: string;
    city?: string;
    state?: string;
  };
  items: {
    name: string;
    image: string;
    quantity: number;
    size?: string;
    price: number;
    oldPrice?: number;
  }[];
}

const OrderHistory = () => {
  const [user] = useAuthState(auth);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);


useEffect(() => {
  if (!user) return;

  const q = query(
    collection(db, "orders"),
    where("userId", "==", user.uid),
    orderBy("date", "desc")
  );

  const unsubscribe = onSnapshot(q, (snap) => {
    const results = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<OrderItem, "id">),
    }));
    setOrders(results);
    setLoading(false);
  });

  return () => unsubscribe(); // cleanup when component unmounts
}, [user]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img src={logo} alt="Loading..." className="w-16 h-16 animate-bounce" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">No past orders</h2>
        <p className="text-gray-500 mt-2">
          Start shopping to place your first order.
        </p>
        <Link to="/">
          <Button className="mt-4 bg-[#A306BD] text-white hover:bg-[#820295]">
            Shop Now
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white shadow-md rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-semibold text-[#A306BD]">
                  Order ID: {order.id.slice(0, 8)}...
                </p>
                <p className="text-sm text-gray-500">
                  Placed on {format(order.date.toDate(), "PPP")}
                </p>

                <p className="text-sm text-gray-500 capitalize flex items-center gap-2">
                  Status:
                  <StatusBadge status={order.status || "pending"} />
                </p>
                <Link to={`/track-order/${order.id}`}>Track Order</Link>
              </div>
              <div className="text-right font-semibold text-lg text-gray-800">
                ₦{order.total.toLocaleString()}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded object-contain border"
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}{" "}
                      {item.size && <span>• Size: {item.size}</span>}
                    </p>
                    <p className="text-sm text-gray-600">
                      ₦{item.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                className="text-sm border-[#A306BD] text-[#A306BD] hover:bg-[#F6E9F9] mt-4 cursor-pointer"
                onClick={() => {
                  setSelectedOrder(order);
                  setDialogOpen(true);
                }}
              >
                View Details
              </Button>

              <Button
                variant="outline"
                className="text-sm border-[#A306BD] text-[#A306BD] hover:bg-[#F6E9F9] mt-4"
              >
                <Link to={`/track-order/${order.id}`}>Track Order</Link>
              </Button>
            </div>

          </div>
        ))}
      </div>

      {selectedOrder && (
        <OrderDetailsDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

export default OrderHistory;
