import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { nigeriaStates } from "@/utils/nigeriaStates";
import { db } from "@/userAuth/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/userAuth/firebase";

export default function AddressFormDialog({
  open,
  onClose,
  initialData,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initialData?: any;
  onSave: () => void;
}) {
  const [user] = useAuthState(auth);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    additionalMobile: "",
    address: "",
    extraAddress: "",
    state: "",
    city: "",
    isDefault: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    }
  }, [initialData]);

  const handleChange = (key: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const data = {
      ...formData,
      createdAt: serverTimestamp(),
    };

    const ref = doc(
      db,
      `users/${user.uid}/addresses/${initialData?.id || crypto.randomUUID()}`
    );

    await setDoc(ref, data, { merge: true });
    onSave(); // refresh address list
    onClose(); // close dialog
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {initialData ? "Edit Address" : "Add Address"}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          {/* First and Last Name */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-3">First Name*</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-3">Last Name*</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>
          </div>

          {/* Mobile Numbers */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-3">Mobile Number*</label>
              <div className="flex gap-2">
                <span className="px-3 py-2 border rounded-md bg-gray-100">+234</span>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-3">Additional Number</label>
              <div className="flex gap-2">
                <span className="px-3 py-2 border rounded-md bg-gray-100">+234</span>
                <input
                  type="tel"
                  value={formData.additionalMobile}
                  onChange={(e) => handleChange("additionalMobile", e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-sm font-medium mb-3">Delivery Address*</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-3">Extra Address</label>
            <input
              type="text"
              value={formData.extraAddress}
              onChange={(e) => handleChange("extraAddress", e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          {/* State and City */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <Select
                value={formData.state}
                onValueChange={(value) => {
                  handleChange("state", value);
                  handleChange("city", ""); // reset city
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(nigeriaStates).map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <Select
                value={formData.city}
                onValueChange={(value) => handleChange("city", value)}
                disabled={!formData.state}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {formData.state &&
                    nigeriaStates[formData.state].map((city: string) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Default Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => handleChange("isDefault", e.target.checked)}
              className="accent-[#A306BD]"
            />
            <label className="text-sm">Set as default shipping address</label>
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full bg-[#A306BD] text-white">
              Save Address
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
