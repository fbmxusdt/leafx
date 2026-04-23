import { Navigate, useLocation, useOutlet } from "react-router";

import { useWeb3AuthContext } from "@/app/contexts/web3auth/context";
import { REDIRECT_URL_KEY } from "@/constants/app";

// ----------------------------------------------------------------------

export default function WalletGuard() {
  const outlet = useOutlet();
  const location = useLocation();
  const { isWeb3Authenticated } = useWeb3AuthContext();

  if (!isWeb3Authenticated) {
    return (
      <Navigate
        to={`/connect?${REDIRECT_URL_KEY}=${location.pathname}`}
        replace
      />
    );
  }

  return <>{outlet}</>;
}
