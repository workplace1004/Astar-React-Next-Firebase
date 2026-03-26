import { Navigate, useSearchParams } from "react-router-dom";
import { LANDING_SUBSCRIBE_SECTION_ID } from "@/lib/landingAnchors";

/**
 * Sustituye la antigua página /subscribe: retornos de pago van al portal; sin query, a la sección de planes en Inicio.
 */
const SubscribeRouteRedirect = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.toString();
  if (q) {
    return <Navigate to={`/portal/subscription?${q}`} replace />;
  }
  return <Navigate to={{ pathname: "/", hash: LANDING_SUBSCRIBE_SECTION_ID }} replace />;
};

export default SubscribeRouteRedirect;
