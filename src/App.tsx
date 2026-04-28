import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import { useAuthStore } from './store/useAuthStore';
import api from './services/api';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetails from './pages/ProductDetails';
import ShopPublic from './pages/ShopPublic';
import ShopsDirectory from './pages/ShopsDirectory';
import OffersPublic from './pages/OffersPublic';
import PromotionsPublic from './pages/PromotionsPublic';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Cookies from './pages/Cookies';
import Contact from './pages/Contact';
import Manufacturers from './pages/Manufacturers';
import ManufacturerModels from './pages/ManufacturerModels';
import VehicleOffers from './pages/VehicleOffers';
import CookieBanner from './components/shared/CookieBanner';
import UserOverview from './pages/Dashboard/UserOverview';
import AdminOverview from './pages/Dashboard/AdminOverview';
import MyLinks from './pages/Dashboard/MyLinks';
import LinkForm from './pages/Dashboard/LinkForm';
import Plans from './pages/Dashboard/Plans';
import Settings from './pages/Dashboard/Settings';
import UserAnalytics from './pages/Dashboard/UserAnalytics';
import EnthusiastDashboard from './pages/Dashboard/EnthusiastDashboard';

import AdminUsers from './pages/Dashboard/AdminUsers';
import AdminAds from './pages/Dashboard/AdminAds';
import AdminAnalytics from './pages/Dashboard/AdminAnalytics';
import AdminPlans from './pages/Dashboard/AdminPlans';
import AdminSettings from './pages/Dashboard/AdminSettings';
import AdminCategories from './pages/Dashboard/AdminCategories';
import AdminLogs from './pages/Dashboard/AdminLogs';
import AdminVehicles from './pages/Dashboard/AdminVehicles';
import Shops from './pages/Dashboard/Shops';
import Offers from './pages/Dashboard/Offers';
import Promotions from './pages/Dashboard/Promotions';
import Redirect from './pages/Redirect';
import CommunitiesListPage from './pages/CommunitiesListPage';
import CommunityAdsPage from './pages/CommunityAdsPage';
import AdminCommunities from './pages/Dashboard/AdminCommunities';
import AdminMarketplaces from './pages/Dashboard/AdminMarketplaces';
import AdDetailPage from './pages/Dashboard/AdDetailPage';

// Temporary placeholder for unbuilt pages
const Placeholder = ({ name }: { name: string }) => (
  <div className="flex items-center justify-center min-h-[60vh] animate-fade-up">
    <div className="text-center">
      <h1 className="text-4xl font-extrabold mb-4">{name}</h1>
      <p className="opacity-40 text-sm tracking-widest uppercase">Módulo em desenvolvimento...</p>
    </div>
  </div>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'admin' | 'user' }) => {
  const { user, isAuthenticated } = useAuthStore();
  
  // Se não estiver logado, vai para login
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  // Se for uma rota de admin e o usuário não for admin, volta pra home
  if (role === 'admin' && user?.role !== 'admin') return <Navigate to="/" replace />;
  
  // Caso contrário, permite o acesso (qualquer logado acessa dashboard comum)
  return <>{children}</>;
};

const PremiumRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.plan !== 'premium') return <Navigate to="/plans" replace />;
  return <>{children}</>;
};

// Layout Wrappers
const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const DashLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  const sidebarType = user?.role === 'admin' ? 'admin' : 'user';
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex">
        <Sidebar type={sidebarType} />
        <main className="flex-1 lg:ml-64 p-6 pt-8 min-h-[calc(100vh-64px)] overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const { isAuthenticated, setUser } = useAuthStore();

  // Sincroniza o perfil com o banco a cada sessão (garante plan, role atualizados)
  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/api/auth/me')
      .then(res => setUser(res.data))
      .catch(() => {});
  }, [isAuthenticated, setUser]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/ofertas" element={<MainLayout><OffersPublic /></MainLayout>} />
        <Route path="/promocoes" element={<MainLayout><PromotionsPublic /></MainLayout>} />
        <Route path="/lojas" element={<MainLayout><ShopsDirectory /></MainLayout>} />
        <Route path="/loja/:slug" element={<ShopPublic />} />
        <Route path="/product/:id" element={<MainLayout><ProductDetails /></MainLayout>} />
        <Route path="/montadoras" element={<MainLayout><Manufacturers /></MainLayout>} />
        <Route path="/montadora/:slug" element={<MainLayout><ManufacturerModels /></MainLayout>} />
        <Route path="/montadora/:manufacturerSlug/:modelSlug" element={<MainLayout><VehicleOffers /></MainLayout>} />
        <Route path="/montadora/:manufacturerSlug/:modelSlug/ofertas" element={<MainLayout><VehicleOffers /></MainLayout>} />
        <Route path="/:manufacturerSlug/:modelSlug" element={<MainLayout><VehicleOffers /></MainLayout>} />
        <Route path="/:manufacturerSlug/:modelSlug/acessorios" element={<MainLayout><VehicleOffers /></MainLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/termos" element={<MainLayout><Terms /></MainLayout>} />
        <Route path="/privacidade" element={<MainLayout><Privacy /></MainLayout>} />
        <Route path="/cookies" element={<MainLayout><Cookies /></MainLayout>} />
        <Route path="/contato" element={<MainLayout><Contact /></MainLayout>} />
        <Route path="/comunidades" element={<MainLayout><CommunitiesListPage /></MainLayout>} />
        <Route path="/comunidades/:id" element={<MainLayout><CommunityAdsPage /></MainLayout>} />

        {/* User Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashLayout><UserOverview /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/enthusiast" element={
          <ProtectedRoute>
            <DashLayout><EnthusiastDashboard /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/my-links" element={
          <ProtectedRoute>
            <DashLayout><MyLinks /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/new-link" element={
          <ProtectedRoute>
            <DashLayout><LinkForm /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/edit-link/:id" element={
          <ProtectedRoute>
            <DashLayout><LinkForm /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/link/:id" element={
          <ProtectedRoute>
            <DashLayout><AdDetailPage /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <DashLayout><UserAnalytics /></DashLayout>
          </ProtectedRoute>
        } />

        <Route path="/plans" element={
          <ProtectedRoute>
            <DashLayout><Plans /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/shops" element={
          <PremiumRoute>
            <DashLayout><Shops /></DashLayout>
          </PremiumRoute>
        } />
        <Route path="/offers" element={
          <ProtectedRoute>
            <DashLayout><Offers /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/promotions" element={
          <ProtectedRoute>
            <DashLayout><Promotions /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <DashLayout><Settings /></DashLayout>
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role="admin">
            <DashLayout><AdminOverview /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/communities" element={
          <ProtectedRoute adminOnly>
            <DashLayout type="admin"><AdminCommunities /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/marketplaces" element={
          <ProtectedRoute adminOnly>
            <DashLayout type="admin"><AdminMarketplaces /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute role="admin">
            <DashLayout><AdminUsers /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/ads" element={
          <ProtectedRoute role="admin">
            <DashLayout><AdminAds /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute role="admin">
            <DashLayout><AdminAnalytics /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/categories" element={
          <ProtectedRoute role="admin">
            <DashLayout><AdminCategories /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/plans" element={
          <ProtectedRoute role="admin">
            <DashLayout><AdminPlans /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/logs" element={
          <ProtectedRoute role="admin">
            <DashLayout><AdminLogs /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/vehicles" element={
          <ProtectedRoute role="admin">
            <DashLayout><AdminVehicles /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute role="admin">
            <DashLayout><AdminSettings /></DashLayout>
          </ProtectedRoute>
        } />

        <Route path="/redirect" element={<Redirect />} />
        <Route path="*" element={<MainLayout><Placeholder name="404" /></MainLayout>} />
      </Routes>
      <CookieBanner />
    </BrowserRouter>
  );
}

export default App;
