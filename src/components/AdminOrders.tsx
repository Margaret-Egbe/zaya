import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  query,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "@/userAuth/firebase";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { serverTimestamp } from "firebase/firestore";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
};

const STATUSES = ["pending", "processing", "shipped", "delivered"];

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      setIsAdmin(snap.exists() && snap.data().isAdmin === true);
    };

    checkAdmin();
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      const q = query(collection(db, "orders"), orderBy("date", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: serverTimestamp(), // 👈 this line forces Firestore to emit a snapshot
      });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success(`Order status updated to "${newStatus}"`);
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading all orders...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex gap-5 mb-7">
        <Button
          className="bg-[#A306BD] text-white py-3 rounded-lg hover:bg-[#8C059F]
                transition duration-200 cursor-pointer"
        >
          {isAdmin && <Link to="/admin">Admin Upload</Link>}
        </Button>

        <Button
          className="bg-[#A306BD] text-white py-3 rounded-lg hover:bg-[#8C059F]
                transition duration-200 cursor-pointer"
        >
          {isAdmin && <Link to="/category">Category</Link>}
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-6">Admin Order Management</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-semibold text-[#A306BD]">
                  Order ID: {order.id.slice(0, 8)}...
                </p>
                <p className="text-sm text-gray-500">
                  Placed on {format(order.date.toDate(), "PPP")}
                </p>
                <p className="text-sm text-gray-500">
                  Buyer:{" "}
                  <span className="font-medium text-gray-800">
                    {order.email}
                  </span>
                </p>
                <p className="text-sm mt-2">
                  Payment:{" "}
                  <span className="capitalize">{order.paymentMethod}</span>
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-lg">
                  ₦{order.total.toLocaleString()}
                </p>
                <span
                  className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-medium ${
                    STATUS_COLORS[order.status] || "bg-gray-200 text-gray-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <label htmlFor={`status-${order.id}`} className="text-sm">
                Change Status:
              </label>
              <select
                id={`status-${order.id}`}
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                className="border px-2 py-1 rounded text-sm"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;
