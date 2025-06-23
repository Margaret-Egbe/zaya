import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
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
    //This logic is check if email has already been used to sign up before
    console.log("🟢 Starting user creation...");

    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      toast.error("This email is already in use. Try logging in instead");
      console.error("🔴 Firestore says email already exists.");

      throw new Error("This email is already in use.");

      console.log("User already exists, duplicated account suspected");
    }

    //Check authentication system for exisiting email
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    if (signInMethods.length > 0) {
      toast.error("This email is already registed. Try logging in instead");
      console.error("🔴 Auth says email already exists.");

      throw new Error("Email already in use");
      return;
    }

    //Create New user Account
    console.log("🟢 Creating Firebase Auth user...");
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("✅ User created:", user.uid);
    await updateProfile(user, { displayName: fullName });

    console.log("🟢 Saving user to Firestore...");
    await setDoc(doc(db, "users", user.uid), {
      fullName: fullName,
      email: email,
      createdAt: serverTimestamp(),
    });
  

    onSuccess();

    console.log("Sign up succes", userCredential.user);
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
