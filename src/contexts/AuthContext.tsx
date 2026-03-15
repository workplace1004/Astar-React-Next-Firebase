import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiLogin, apiRegister, apiMe, setToken, clearToken, apiUpdateProfile, apiChangePassword, type ApiUser } from "@/lib/api";

export type UserRole = "admin" | "client" | null;
export type SubscriptionStatus = "active" | "inactive" | "cancelled" | null;

interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  subscriptionStatus: SubscriptionStatus;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  profileLoaded: boolean;
  login: (email: string, password: string) => Promise<
    | { success: true; role: "admin" | "client" }
    | { success: false; errorCode?: string; errorMessage?: string }
  >;
  logout: () => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    birthDate: string;
    birthPlace: string;
    birthTime: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasActiveSubscription: boolean;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; birthDate?: string; birthPlace?: string; birthTime?: string; avatarUrl?: string }) => Promise<{ ok: true } | { ok: false; error: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ ok: true } | { ok: false; error: string }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function mapApiUser(u: ApiUser): User {
  return {
    uid: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    isActive: u.isActive,
    subscriptionStatus: u.subscriptionStatus,
    avatarUrl: u.avatarUrl ?? null,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiMe()
      .then((apiUser) => {
        if (!cancelled && apiUser) setUser(mapApiUser(apiUser));
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) {
          setProfileLoaded(true);
          setAuthLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<
    | { success: true; role: "admin" | "client" }
    | { success: false; errorCode?: string; errorMessage?: string }
  > => {
    try {
      const { user: apiUser, access_token } = await apiLogin(email, password);
      setToken(access_token);
      setUser(mapApiUser(apiUser));
      return { success: true, role: apiUser.role };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, errorCode: "auth/invalid-credential", errorMessage: message };
    }
  };

  const logout = async (): Promise<void> => {
    clearToken();
    setUser(null);
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    birthDate: string;
    birthPlace: string;
    birthTime: string;
  }): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      const { user: apiUser, access_token } = await apiRegister(data);
      setToken(access_token);
      setUser(mapApiUser(apiUser));
      return { ok: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo crear la cuenta.";
      return { ok: false, error: message };
    }
  };

  const refreshUser = async () => {
    const apiUser = await apiMe();
    if (apiUser) setUser(mapApiUser(apiUser));
  };

  const updateProfile = async (data: { name?: string; email?: string; birthDate?: string; birthPlace?: string; birthTime?: string; avatarUrl?: string }): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      const apiUser = await apiUpdateProfile(data);
      setUser(mapApiUser(apiUser));
      return { ok: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo actualizar el perfil.";
      return { ok: false, error: message };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      await apiChangePassword(currentPassword, newPassword);
      return { ok: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo cambiar la contraseña.";
      return { ok: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        profileLoaded,
        login,
        logout,
        register,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        hasActiveSubscription: user?.subscriptionStatus === "active",
        refreshUser,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
