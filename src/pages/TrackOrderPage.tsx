import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "@/userAuth/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { format } from "date-fns";
import { CheckCircle, Clock, Truck, Settings } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/loading_logo.png";

interface Order {
  id: string;
  status: string;
  date: any;
  shippedDate?: any;
  deliveredDate?: any;
}

const statusSteps = [
  { label: "Pending", icon: Clock, color: "yellow" },
  { label: "Processing", icon: Settings, color: "blue" },
  { label: "Shipped", icon: Truck, color: "purple" },
  { label: "Delivered", icon: CheckCircle, color: "green" },
];

const TrackOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const ref = doc(db, "orders", orderId);

    // 👇 Use onSnapshot to listen in real time
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setOrder({ ...(snap.data() as Order), id: snap.id });
      }
      setLoading(false);
    });

    return () => unsubscribe(); // 🔥 Cleanup on unmount
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img src={logo} alt="Loading..." className="w-16 h-16 animate-bounce" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Order not found</h2>
        <p className="text-gray-500 mt-2">Please check the order ID.</p>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(
    (step) => step.label.toLowerCase() === order.status?.toLowerCase()
  );

  return (
    <div className="max-w-2xl mx-auto mt-10 mb-10 px-4 py-10 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold text-center mb-8">
        Tracking Order: {order.id.slice(0, 10)}...
      </h1>

      <div className="relative ml-6 pl-6 space-y-10">
        {/* Animated progress bar background */}
        <div className="absolute top-0 left-[-1px] w-1 h-full bg-purple-200 overflow-hidden">
          <motion.div
            className="w-full bg-gradient-to-b from-[#A306BD] to-[#820295]"
            initial={{ height: 0 }}
            animate={{
              height: `${((currentStepIndex + 1) / statusSteps.length) * 100}%`,
            }}
            transition={{ duration: 0.6 }}
          />
        </div>

        {/* Step bubbles and labels */}
        {statusSteps.map((step, index) => {
          const isActive = index <= currentStepIndex;
          const Icon = step.icon;

          const colorMap = {
            yellow: "bg-yellow-100 text-yellow-700",
            blue: "bg-blue-100 text-blue-700",
            purple: "bg-purple-100 text-purple-700",
            green: "bg-green-100 text-green-700",
          };

          const bubbleColor = colorMap[step.color as keyof typeof colorMap];

          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`relative flex gap-4 items-start ${
                isActive
                  ? "opacity-100 translate-y-0"
                  : "opacity-60 translate-y-1"
              }`}
            >
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 
            ${
              isActive ? bubbleColor : "bg-white border-gray-300 text-gray-400"
            }`}
              >
                <Icon size={20} />
              </div>

              <div>
                <h3
                  className={`font-semibold ${
                    isActive ? "text-black" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </h3>
                {index === 0 && (
                  <p className="text-sm text-gray-400">
                    Placed on {format(order.date?.toDate?.(), "PPP")}
                  </p>
                )}
                {index === 2 && order.shippedDate && (
                  <p className="text-sm text-gray-400">
                    Shipped on {format(order.shippedDate.toDate(), "PPP")}
                  </p>
                )}
                {index === 3 && order.deliveredDate && (
                  <p className="text-sm text-gray-400">
                    Delivered on {format(order.deliveredDate.toDate(), "PPP")}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackOrder;
