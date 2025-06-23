import HomePage from "@/components/HomePage";
import Layout from "@/layout/layout";
import { createBrowserRouter } from "react-router-dom";
import SignInPage from "@/userAuth/SignInPage";
import SignUpPage from "@/userAuth/SignUpPage";
import SavedItems from "@/pages/SavedItems";
import WelcomeUserMobile from "@/pages/WelcomePage";
import ProtectedRoute from "./ProtectedRoute";
import ForgotPassword from "@/userAuth/ForgotPassword";
import UploadProduct from "@/products/UploadProduct";
import UploadCategory from "@/products/UploadCategory";
import CategoryPage from "@/pages/CategoryPage";
import ProductPage from "@/pages/ProductPage";
import SearchPage from "@/pages/SearchPage";
import Cart from "@/components/Cart";
import AddressBook from "@/pages/AddressBook";
import Checkout from "@/components/CheckOut";
import Congratulations from "@/components/Congratulations";
import OrderHistory from "@/pages/OrderHistory";
import AdminOrders from "@/components/AdminOrders";
import TrackOrderPage from "@/pages/TrackOrderPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout showHero>
        <HomePage />
      </Layout>
    ),
  },
  {
    path: "/signin",
    element: <SignInPage toggleAuth={() => {}} />,
  },
  {
    path: "/signup",
    element: <SignUpPage toggleAuth={() => {}} />,
  },

 // Links to admins
  {
    path: "/admin",
    element: <UploadProduct />,
  },
  {
    path: "/admins",
    element: <AdminOrders />,
  },
  {
    path: "/category",
    element: <UploadCategory />,
  },
  {
    path: "/category/:categoryName",
    element: (
      <Layout>
        <CategoryPage />,
      </Layout>
    ),
  },
  {
    path: "product/:productId",
    element: (
      <Layout>
        <ProductPage />,
      </Layout>
    ),
  },
   {
    path: "/track-order/:orderId",
    element: (
      <Layout>
        <TrackOrderPage />,
      </Layout>
    ),
  },
  {
    path: "/welcomeUserMobile",
    element: (
      <Layout>
        <WelcomeUserMobile />,
      </Layout>
    ),
  },
  {
    path: "/search",
    element: (
      <Layout>
        <SearchPage />,
      </Layout>
    ),
  },
  {
    path: "cart",
    element: (
      <Layout>
        <Cart />,
      </Layout>
    ),
  },
  {
    path: "/forgetpsw",
    element: <ForgotPassword />,
  },
   {
    path: "/congratulations",
    element: <Congratulations />,
  },

  {
    element: <ProtectedRoute />, // protected route wrapper
    children: [
      {
        path: "/saved-items",
        element: (
          <Layout>
            <SavedItems />,
          </Layout>
        ),
      },
      {
        path: "/orders",
        element: (
          <Layout>
            <OrderHistory />,
          </Layout>
        ),
      },
      {
        path: "/address",
        element: (
          <Layout>
            <AddressBook />,
          </Layout>
        ),
      },
       {
        path: "/checkout",
        element: (
          <Layout>
            <Checkout />,
          </Layout>
        ),
      },
    ],
  },
]);
export default router;
