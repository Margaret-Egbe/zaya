import React, { useState } from "react";
import { db } from "../userAuth/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const UploadCategory: React.FC = () => {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name || !imageUrl) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "categories"), {
        name,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      setName("");
      setImageUrl("");
      setSuccess("Category uploaded successfully!");
    } catch (err) {
      console.error(err);
      setError("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-2 max-w-md mx-auto p-4 border rounded shadow-md mt-20">
      <h2 className="text-xl font-semibold mb-2">Upload Category</h2>

      <input
        type="text"
        value={name}
        placeholder="Category name"
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="text"
        value={imageUrl}
        placeholder="Image URL"
        onChange={(e) => setImageUrl(e.target.value)}
        className="border p-2 rounded"
      />

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" disabled={loading}>
        {loading ? "Uploading..." : "Upload Category"}
      </button>

      {success && <p className="text-green-600">{success}</p>}
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
};

export default UploadCategory;
