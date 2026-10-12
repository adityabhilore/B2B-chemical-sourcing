// src/App.jsx — Client-side router (React Router v6)
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Toaster from './components/ui/Toast';

// Pages
import HomePage from './pages/public/HomePage';
import StyleGuidePage from './pages/dev/StyleGuidePage';
import DashboardPage from './pages/admin/DashboardPage';
import CustomerLayout from './components/layout/CustomerLayout';
import HealthCheckPage from './pages/dev/HealthCheckPage';
import { AuthProvider } from './context/AuthContext';
import { AdminRoute, ProtectedRoute } from './components/auth/RouteGuards';
import AuthPage from './pages/auth/AuthPage';
import AccountProfilePage from './pages/customer/AccountProfilePage';
import CatalogueAdminPage from './pages/admin/CatalogueAdminPage';
import ProductsPage from './pages/admin/ProductsPage';
import ProductFormPage from './pages/admin/ProductFormPage';
import PublicProductsPage from './pages/public/ProductsPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import ContactPage from './pages/public/ContactPage';
import { BlogListPage, BlogDetailPage } from './pages/public/BlogPages';
import { BlogAdminPage, HomepageAdminPage, SiteSettingsPage, EnquiriesPage } from './pages/admin/ContentAdminPages';
import { OrderRequestPage, MyOrdersPage, OrderDetailPage } from './pages/customer/OrdersPage';
import { OrdersAdminPage, OrderAdminDetailPage } from './pages/admin/OrdersAdminPage';
import { CustomersAdminPage, CustomerAdminDetailPage } from './pages/admin/CustomersAdminPage';
import ShippingAdminPage from './pages/admin/ShippingAdminPage';

// Placeholder pages — implement these in future phases
const Placeholder = ({ name }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
    <div className="w-16 h-16 rounded-2xl bg-navy-100 flex items-center justify-center text-navy-600">
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
      </svg>
    </div>
    <h1 className="text-xl font-semibold font-heading text-slate-900">{name}</h1>
    <p className="text-sm text-slate-500">[PLACEHOLDER] This page will be built in a future phase.</p>
    <a href="/" className="btn btn-outline btn-sm mt-2 no-underline">Back to Home</a>
  </div>
);

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
       <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<PublicProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<Placeholder name="About Us" />} />

          {/* Auth */}
          <Route path="/auth/login" element={<AuthPage />} />
          <Route path="/auth/register" element={<AuthPage mode="register" />} />
          <Route path="/admin/login" element={<AuthPage admin />} />
          <Route path="/auth/forgot-password" element={<Placeholder name="Forgot Password" />} />

          {/* Customer */}
          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<CustomerLayout title="My Account"><AccountProfilePage /></CustomerLayout>} />
            <Route path="/account/profile" element={<CustomerLayout title="My Profile"><AccountProfilePage /></CustomerLayout>} />
            <Route path="/account/order-request" element={<CustomerLayout title="Order Request"><OrderRequestPage /></CustomerLayout>} />
            <Route path="/account/orders" element={<CustomerLayout title="My Orders"><MyOrdersPage /></CustomerLayout>} />
            <Route path="/account/orders/:id" element={<CustomerLayout title="Order Detail"><OrderDetailPage /></CustomerLayout>} />
          </Route>

          {/* Admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/products" element={<ProductsPage />} />
            <Route path="/admin/products/new" element={<ProductFormPage />} />
            <Route path="/admin/products/:id" element={<ProductFormPage />} />
            <Route path="/admin/categories" element={<CatalogueAdminPage kind="categories" />} />
            <Route path="/admin/brands" element={<CatalogueAdminPage kind="brands" />} />
            <Route path="/admin/companies" element={<CatalogueAdminPage kind="companies" />} />
            <Route path="/admin/orders" element={<OrdersAdminPage />} />
            <Route path="/admin/orders/:id" element={<OrderAdminDetailPage />} />
            <Route path="/admin/blog" element={<BlogAdminPage />} />
            <Route path="/admin/blog/new" element={<BlogAdminPage />} />
            <Route path="/admin/customers" element={<CustomersAdminPage />} />
            <Route path="/admin/customers/:id" element={<CustomerAdminDetailPage />} />
            <Route path="/admin/shipping" element={<ShippingAdminPage />} />
            <Route path="/admin/settings" element={<SiteSettingsPage />} />
            <Route path="/admin/homepage" element={<HomepageAdminPage />} />
            <Route path="/admin/enquiries" element={<EnquiriesPage />} />
          </Route>

          {/* Dev tools */}
          {import.meta.env.DEV && <Route path="/style-guide" element={<StyleGuidePage />} />}
          {import.meta.env.DEV && <Route path="/health-check" element={<HealthCheckPage />} />}

          {/* Catch-all */}
          <Route path="*" element={<Placeholder name="404 — Page Not Found" />} />
        </Routes>
       </AuthProvider>
      </BrowserRouter>

      {/* Global toast container */}
      <Toaster />
    </ToastProvider>
  );
}
