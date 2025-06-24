import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { toast } from "sonner";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  updateProfile,
} from "firebase/auth";

export const createUser = async (
  email: string,
  password: string,
  fullName: string,
  onSuccess: () => void
) => {
  try {
    console.log("🟢 Starting user creation...");

    // ✅ Check if email is already registered in Firebase Auth
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    if (signInMethods.length > 0) {
      toast.error("This email is already registered. Try logging in instead");
      console.error("🔴 Auth says email already exists.");
      throw new Error("Email already in use");
    }

    // ✅ Create Firebase Auth user
    console.log("🟢 Creating Firebase Auth user...");
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await userCredential.user.getIdToken(true); // Force refresh token
    await new Promise((res) => setTimeout(res, 500)); // Small delay

    const user = userCredential.user;
    console.log("✅ User created:", user.uid);

    // ✅ Update profile
    await updateProfile(user, { displayName: fullName });

    // ✅ Save user data to Firestore
    console.log("🟢 Saving user to Firestore...");
    await setDoc(doc(db, "users", user.uid), {
      fullName: fullName,
      email: email,
      createdAt: serverTimestamp(),
    });

    onSuccess();
    console.log("🎉 Signup complete.");

  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message, {
        duration: 3000,
      });
      console.error("🔴 Error during signup:", error.message);
    } else {
      toast.error("An unknown error occurred", {
        duration: 3000,
      });
      console.error("🔴 Unknown error during signup:", error);
    }
  }
};

export default createUser;
