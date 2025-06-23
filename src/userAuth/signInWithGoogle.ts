import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

/**
 * Sign in with Google and optionally redirect to the previous page.
 *
 * @param navigate - React Router `navigate` function.
 * @param from - Optional path to redirect to after login (e.g., "/checkout").
 */
export const signInWithGoogle = async (
  navigate: (path: string) => void,
  from?: string
) => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      // Save new user
      await setDoc(doc(db, "users", user.uid), {
        fullName: user.displayName,
        email: user.email,
        createdAt: serverTimestamp(),
      });
    }

    // Save user to localStorage
    const userData = {
      fullName: user.displayName,
      email: user.email,
      uid: user.uid,
    };
    localStorage.setItem("userdetails", JSON.stringify(userData));

    toast.success("Signed In");

    // 👇 Redirect back to the original page or homepage
    navigate(from || "/");
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("An unknown error occurred");
    }
  }
};
