// components/OrderDetailsDialog.tsx
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import StatusBadge from "@/components/StatusBadge";

interface OrderItem {
  name: string;
  image: string;
  quantity: number;
  size?: string;
  price: number;
  oldPrice?: number;
}

interface OrderDetailsProps {
  open: boolean;
  onClose: () => void;
  order: {
    id: string;
    total: number;
    subtotal: number;
    deliveryFee: number;
    discount: number;
    couponDiscount?: number;
    productDiscount?: number;
    paymentMethod: string;
    status: string;
    date: any;
    items: OrderItem[];
    shippingAddress?: {
      fullName?: string;
      phoneNumber?: string;
      addressLine1?: string;
      city?: string;
      state?: string;
    };
  };
}

const OrderDetailsDialog: React.FC<OrderDetailsProps> = ({ open, onClose, order }) => {
  const printReceipt = () => window.print();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-h-[90vh] sm:max-w-[700px]  print:bg-white print:text-black print:shadow-none overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Order Details • #{order.id}
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-gray-600 space-y-2 print:text-black">
          <p>
            <strong>Date:</strong> {format(order.date.toDate(), "PPP")}
          </p>
        
          <p className="text-sm text-gray-500 capitalize flex items-center gap-2">
                  Status:
                  <StatusBadge status={order.status || "pending"} />
                </p>
          <p>
            <strong>Payment Method:</strong> {order.paymentMethod}
          </p>

          {order.shippingAddress && (
            <div className="mt-4">
              <p className="font-semibold text-[#A306BD]">Shipping Address</p>
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phoneNumber}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-4 print:text-black">
          <h3 className="font-semibold">Items</h3>
          {order.items.map((item, index) => (
            <div key={index} className="flex gap-3 items-center border-b pb-2">
              <img src={item.image} alt={item.name} className="w-12 h-12 object-contain rounded" />
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">
                  Qty: {item.quantity} {item.size && `• Size: ${item.size}`}
                </p>
                <p className="text-sm">₦{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1 text-sm text-gray-700 print:text-black">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₦{order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee:</span>
            <span>
              {order.deliveryFee === 0 ? "Free" : `₦${order.deliveryFee.toLocaleString()}`}
            </span>
          </div>
          <div className="flex justify-between text-[#A306BD]">
            <span>Discount:</span>
            <span>-₦{order.discount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>₦{order.total.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 print:hidden ">
          <Button variant="outline" onClick={onClose}
          className="cursor-pointer"
          >
            Close
          </Button>
          <Button className="bg-[#A306BD] text-white hover:bg-[#8C059F]  cursor-pointer" onClick={printReceipt}>
            Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
