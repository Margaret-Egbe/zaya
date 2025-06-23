import { RouterProvider } from "react-router-dom";
import "./App.css";
import router from "./routes/router";
import { UserProvider } from "./userAuth/UserContext";
import { CartProvider } from "./components/CartContext";


function AppRoutes() {
  return (
     <UserProvider>
      <CartProvider>
     <RouterProvider  router={router}/>
      </CartProvider>
    </UserProvider>
  );
}

export default AppRoutes;
