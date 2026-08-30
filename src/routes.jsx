/* eslint-disable react-refresh/only-export-components -- patrón estándar de createBrowserRouter con componentes inline */
import { createBrowserRouter, Outlet } from "react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Listing from "@/pages/Listing";
import PetDetail from "@/pages/PetDetail";
import Login from "@/pages/Login";
import ReportForm from "@/pages/ReportForm";

function Root() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function LoginRoot() {
  return <Login />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "buscar", Component: Listing },
      { path: "mascota/:id", Component: PetDetail },
      { path: "reportar", Component: ReportForm },
    ],
  },
  {
    path: "/login",
    Component: LoginRoot,
  },
]);
