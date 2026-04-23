// Import Dependencies
import { Navigate, useOutlet } from "react-router";

// Local Imports
import { useWeb3AuthContext } from "@/app/contexts/web3auth/context";
import { HOME_PATH, REDIRECT_URL_KEY } from "@/constants/app";

// ----------------------------------------------------------------------

export default function GhostGuard() {
  const outlet = useOutlet();
  const { isWeb3Authenticated } = useWeb3AuthContext();

  const url = new URLSearchParams(window.location.search).get(REDIRECT_URL_KEY);

  if (isWeb3Authenticated) {
    return <Navigate to={url || HOME_PATH} replace />;
  }

  return <>{outlet}</>;
}
