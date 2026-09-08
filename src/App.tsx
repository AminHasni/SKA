import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutGrid, 
  Globe, 
  Moon, 
  Sun, 
  ClipboardList, 
  Receipt, 
  LogOut, 
  ShieldCheck, 
  UserCheck, 
  Menu, 
  X,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";
import Dashboard from "./pages/Dashboard";
import FichesList from "./pages/FichesList";
import CreateFiche from "./pages/CreateFiche";
import FicheDetails from "./pages/FicheDetails";
import FacturesList from "./pages/FacturesList";
import FactureDetails from "./pages/FactureDetails";
import CreateFacture from "./pages/CreateFacture";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function TopRightHeaderControls() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1">
      {/* Theme Toggle Icon */}
      <button
        onClick={toggleTheme}
        title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
        className="p-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center justify-center"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Language Toggle Icon */}
      <button
        onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
        title={language === 'fr' ? 'العربية' : 'Français'}
        className="p-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5"
      >
        <Globe size={20} />
        <span className="text-xs font-bold uppercase tracking-wider">{language === 'fr' ? 'AR' : 'FR'}</span>
      </button>

      <div className="w-px h-5 bg-stone-200 dark:bg-stone-800 mx-1" />

      {/* Logout Icon */}
      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
        title={language === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}
        className="p-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center justify-center"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
}

function SidebarLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { t, language } = useLanguage();
  const { user, isAdmin } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user || location.pathname === "/login") {
    return <>{children}</>;
  }

  const navItems = [
    { name: t("sidebar.dashboard"), path: "/", icon: LayoutGrid, allowed: true },
    { name: t("sidebar.fiches"), path: "/fiches", icon: ClipboardList, allowed: true },
    { name: t("sidebar.factures"), path: "/factures", icon: Receipt, allowed: isAdmin },
  ];

  const checkActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/dashboard';
    if (path === '/fiches') return location.pathname.startsWith('/fiches');
    if (path === '/factures') return location.pathname.startsWith('/factures');
    return location.pathname === path;
  };

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#FCFBF9] dark:bg-[#111110]">
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        />
      )}

      {/* Sidebar (Desktop Permanent + Mobile Slide Drawer) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-30 bg-white dark:bg-[#161615] border-r border-stone-200/80 dark:border-stone-800/80 flex flex-col transition-all duration-300 ease-in-out shrink-0 shadow-xl lg:shadow-none ${
          mobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
        } ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 flex items-center justify-between border-b border-stone-100 dark:border-stone-800/60">
          <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? "lg:hidden" : ""}`}>
            <div className="w-8 h-8 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-display font-bold text-base flex items-center justify-center rounded-xl shadow-sm shrink-0">
              K
            </div>
            <div className="truncate">
              <span className="font-display font-bold text-base text-stone-900 dark:text-stone-100 block leading-tight">
                {t("app.title")}
              </span>
              <span className="text-[10px] text-stone-400 font-medium block">
                {t("app.subtitle")}
              </span>
            </div>
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            title={isCollapsed ? (language === 'ar' ? 'توسيع القائمة' : 'Déplier la sidebar') : (language === 'ar' ? 'إخفاء القائمة' : 'Réduire la sidebar')}
          >
            {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.filter(i => i.allowed).map((item) => {
            const Icon = item.icon;
            const active = checkActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active 
                    ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm font-semibold" 
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/70 hover:text-stone-900 dark:hover:text-stone-100"
                } ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
              >
                <Icon size={19} className="shrink-0" strokeWidth={active ? 2.5 : 2} />
                {(!isCollapsed || mobileOpen) && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Viewport with Sticky Header */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header Bar with Controls on Right */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#161615]/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-display font-bold text-sm flex items-center justify-center rounded-lg">
                K
              </div>
              <span className="font-display font-bold text-base text-stone-900 dark:text-stone-100 truncate">
                {t("app.title")}
              </span>
            </div>
          </div>

          {/* Top Right Action Icons */}
          <TopRightHeaderControls />
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <SidebarLayout>
              <Routes>
                <Route path="/login" element={<Login />} />

                {/* Dashboard - All Roles */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />

                {/* Fiches de travail - All Roles */}
                <Route path="/fiches" element={
                  <ProtectedRoute>
                    <FichesList />
                  </ProtectedRoute>
                } />
                <Route path="/fiches/new" element={
                  <ProtectedRoute>
                    <CreateFiche />
                  </ProtectedRoute>
                } />
                <Route path="/fiches/:id" element={
                  <ProtectedRoute>
                    <FicheDetails />
                  </ProtectedRoute>
                } />
                <Route path="/fiches/:id/edit" element={
                  <ProtectedRoute>
                    <CreateFiche />
                  </ProtectedRoute>
                } />

                {/* Factures - Admin Only */}
                <Route path="/factures" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <FacturesList />
                  </ProtectedRoute>
                } />
                <Route path="/factures/new" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <CreateFacture />
                  </ProtectedRoute>
                } />
                <Route path="/factures/:id" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <FactureDetails />
                  </ProtectedRoute>
                } />
                <Route path="/factures/:id/edit" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <CreateFacture />
                  </ProtectedRoute>
                } />
              </Routes>
            </SidebarLayout>
            <OfflineIndicator />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
