import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { portalGetExtrasSelections, portalPutExtrasSelections } from "@/lib/api";
import { toast } from "@/components/ui/sonner";

interface PortalExtrasCartContextType {
  /** True after initial load from API (success or failure). */
  selectionsReady: boolean;
  cartServiceIds: string[];
  itemCount: number;
  isInCart: (serviceId: string) => boolean;
  toggleInCart: (serviceId: string) => void;
  isFavorite: (serviceId: string) => boolean;
  toggleFavorite: (serviceId: string) => void;
  /** Reload favorites + cart from server (e.g. after checkout cleared the cart). */
  reloadSelections: () => Promise<void>;
}

const PortalExtrasCartContext = createContext<PortalExtrasCartContextType | null>(null);

export function PortalExtrasCartProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [cartServiceIds, setCartServiceIds] = useState<string[]>([]);
  const [selectionsReady, setSelectionsReady] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadSucceeded = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void portalGetExtrasSelections()
      .then((d) => {
        if (cancelled) return;
        loadSucceeded.current = true;
        setFavoriteIds(d.favoriteIds);
        setCartServiceIds(d.cartServiceIds);
      })
      .catch(() => {
        if (cancelled) return;
      })
      .finally(() => {
        if (!cancelled) setSelectionsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectionsReady || !loadSucceeded.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      void portalPutExtrasSelections({ favoriteIds, cartServiceIds }).catch((err) => {
        toast.error("No se pudo guardar", {
          description: err instanceof Error ? err.message : "Reintentá en un momento.",
          position: "top-right",
        });
      });
    }, 450);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [favoriteIds, cartServiceIds, selectionsReady]);

  const toggleFavorite = useCallback((serviceId: string) => {
    setFavoriteIds((prev) => (prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]));
  }, []);

  const toggleInCart = useCallback((serviceId: string) => {
    setCartServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    );
  }, []);

  const reloadSelections = useCallback(async () => {
    try {
      const d = await portalGetExtrasSelections();
      loadSucceeded.current = true;
      setFavoriteIds(d.favoriteIds);
      setCartServiceIds(d.cartServiceIds);
    } catch {
      /* keep local state */
    }
  }, []);

  const isFavorite = useCallback((serviceId: string) => favoriteIds.includes(serviceId), [favoriteIds]);

  const isInCart = useCallback((serviceId: string) => cartServiceIds.includes(serviceId), [cartServiceIds]);

  const itemCount = cartServiceIds.length;

  const value = useMemo(
    () => ({
      selectionsReady,
      cartServiceIds,
      itemCount,
      isInCart,
      toggleInCart,
      isFavorite,
      toggleFavorite,
      reloadSelections,
    }),
    [
      cartServiceIds,
      selectionsReady,
      itemCount,
      isInCart,
      toggleInCart,
      isFavorite,
      toggleFavorite,
      reloadSelections,
    ],
  );

  return <PortalExtrasCartContext.Provider value={value}>{children}</PortalExtrasCartContext.Provider>;
}

export function usePortalExtrasCart() {
  const ctx = useContext(PortalExtrasCartContext);
  if (!ctx) throw new Error("usePortalExtrasCart must be used within PortalExtrasCartProvider");
  return ctx;
}
