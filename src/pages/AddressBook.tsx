import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth } from "@/userAuth/firebase";
import { Card } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import AddressFormDialog from "@/components/AddressFormDialog";
import logo from "../assets/loading_logo.png";


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

export default function AddressBook() {
  const [user] = useAuthState(auth);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState<Address | null>(null);

  const fetchAddresses = async () => {
    if (!user) return;
    setLoading(true);
    const ref = collection(db, `users/${user.uid}/addresses`);
    const snapshot = await getDocs(ref);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Address[];
    setAddresses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  if (!user) {
    return <p className="text-center mt-10">Please log in to view your address book.</p>;
  }

  if (loading) {
      return (
      <div className="flex justify-center items-center h-screen">
        <img src={logo} alt="Loading..." className="w-16 h-16 animate-bounce" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Address Book</h2>

      {addresses.length === 0 ? (
        <p className="text-center text-gray-600">No addresses saved yet.</p>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <Card key={address.id} className="p-5 border rounded-xl shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg">
                    {address.firstName} {address.lastName}
                  </p>
                  <p className="text-sm">Phone: {address.mobile}</p>
                  {address.additionalMobile && (
                    <p className="text-sm">Alt: {address.additionalMobile}</p>
                  )}
                  <p className="text-sm mt-1">
                    {address.address}
                    {address.extraAddress && `, ${address.extraAddress}`}
                  </p>
                  <p className="text-sm">
                    {address.city}, {address.state}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {address.isDefault && (
                    <span className="text-xs font-semibold text-white bg-[#A306BD] px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                  <button
                    className="text-gray-500 hover:text-purple-600"
                    onClick={() => {
                      setEditData(address);
                      setOpenDialog(true);
                    }}
                  >
                    <Pencil size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddressFormDialog
        open={openDialog}
        onClose={() => {
          setEditData(null);
          setOpenDialog(false);
        }}
        initialData={editData}
        onSave={fetchAddresses}
      />
    </div>
  );
}
