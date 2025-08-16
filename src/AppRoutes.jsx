import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./components/Login/AuthPage.jsx";
import DashboardLayout from "./components/common/DashboardLayout";
import AuthLayout from "./components/common/AuthLayout.jsx";

import Home from "./pages/Home/Home.jsx";
import Orders from "./pages/Orders/Orders.jsx";
import Revenues from "./pages/Revenues/Revenues.jsx";
import Stock from "./pages/Stock/Stock.jsx";
import Employees from "./pages/Employees/Employees.jsx";
import Reports from "./pages/Reports/Reports.jsx";

import PrivateRoute from "./routes/PrivateRoutes.jsx";
import RoleBasedRoute from "./routes/RoleBasedRoute.jsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Páginas públicas */}
        <Route
          path="/"
          element={
            <AuthLayout>
              <AuthPage />
            </AuthLayout>
          }
        />
        <Route
          path="/usuario"
          element={
            <AuthLayout>
              <AuthPage />
            </AuthLayout>
          }
        />

        {/* Rotas privadas comuns */}
        <Route element={<PrivateRoute />}>
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="orders" element={<Orders />} />
            <Route path="stock" element={<Stock />} />

            {/* Acesso para supervisor_junior e supervisor_senior */}
            <Route element={<RoleBasedRoute allowedRoles={["SUPERVISOR_JUNIOR", "SUPERVISOR_SENIOR"]} />}>
              <Route path="revenues" element={<Revenues />} />
            </Route>

            {/* Apenas supervisor_senior */}
            <Route element={<RoleBasedRoute allowedRoles={["SUPERVISOR_SENIOR"]} />}>
              <Route path="employees" element={<Employees />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Route>
        </Route>

        {/* Redireciona para login para qualquer rota desconhecida */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
