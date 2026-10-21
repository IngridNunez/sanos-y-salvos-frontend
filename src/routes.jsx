/* eslint-disable react-refresh/only-export-components -- patrón estándar de createBrowserRouter con componentes inline */
import { createBrowserRouter, Outlet, useLocation } from "react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InAppBrowserBanner from "@/components/InAppBrowserBanner";
import Home from "@/pages/Home";
import Listing from "@/pages/Listing";
import PetDetail from "@/pages/PetDetail";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import ReportForm from "@/pages/ReportForm";
import EditForm from "@/pages/EditForm";
import Profile from "@/pages/Profile";
import Privacidad from "@/pages/Privacidad";
import Conocenos from "@/pages/Conocenos";
import Alianzas from "@/pages/Alianzas";
import Contacto from "@/pages/Contacto";
import Terminos from "@/pages/Terminos";
import ConfirmarReunificacion from "@/pages/ConfirmarReunificacion";
import AdminDashboard from "@/pages/AdminDashboard";
import ErrorPage from "@/pages/ErrorPage";

function Root() {
  // El Perfil tiene su propio panel lateral pegajoso (sticky) a todo el alto
  // de su contenido — el Footer debajo se ve cortado por esa transición, así
  // que en esta página se omite.
  const { pathname } = useLocation();
  const ocultarFooter = pathname.startsWith("/perfil") || pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      <InAppBrowserBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {!ocultarFooter && <Footer />}
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
    errorElement: <ErrorPage />,
    children: [
      { index: true, Component: Home },
      { path: "buscar", Component: Listing },
      { path: "mascota/:id", Component: PetDetail },
      { path: "reportar", Component: ReportForm },
      { path: "editar/:id", Component: EditForm },
      { path: "perfil", Component: Profile },
      { path: "privacidad", Component: Privacidad },
      { path: "terminos", Component: Terminos },
      { path: "conocenos", Component: Conocenos },
      { path: "alianzas", Component: Alianzas },
      { path: "contacto", Component: Contacto },
      { path: "confirmar-reunificacion/:id", Component: ConfirmarReunificacion },
      { path: "admin", Component: AdminDashboard },
    ],
  },
  {
    path: "/login",
    Component: LoginRoot,
    errorElement: <ErrorPage />,
  },
  {
    path: "/auth/callback",
    Component: AuthCallback,
    errorElement: <ErrorPage />,
  },
]);
