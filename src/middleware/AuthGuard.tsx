// Import Dependencies
import { Navigate, useLocation, useOutlet } from "react-router";

// Local Imports
import { useWeb3AuthContext } from "@/app/contexts/web3auth/context";
import { GHOST_ENTRY_PATH, REDIRECT_URL_KEY } from "@/constants/app";

// ----------------------------------------------------------------------

export default function AuthGuard() {
  const outlet = useOutlet();
  const { isWeb3Authenticated } = useWeb3AuthContext();

  const location = useLocation();

  if (!isWeb3Authenticated) {
    const redirect = location.pathname && location.pathname !== "/" ? location.pathname : "";
    const to = redirect ? `${GHOST_ENTRY_PATH}?${REDIRECT_URL_KEY}=${redirect}` : GHOST_ENTRY_PATH;
    return <Navigate to={to} replace />;
  }

  return <>{outlet}</>;
}
