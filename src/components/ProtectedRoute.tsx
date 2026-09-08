import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types";
import { ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF9] dark:bg-[#111110] text-stone-400 font-medium animate-pulse">
        Vérification de l'authentification...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 md:p-12 max-w-2xl mx-auto my-12 bg-white dark:bg-[#161615] border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert size={24} />
        </div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
          Accès Restreint
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Votre compte (Rôle : <strong>{user.role === 'admin' ? 'Administrateur' : 'Technicien / Agent'}</strong>) ne dispose pas des autorisations nécessaires pour accéder à ce module réservé à l'administration.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
