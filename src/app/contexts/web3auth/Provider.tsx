import { ReactNode, useEffect } from "react";
import { useConnection, useConnect, useDisconnect, useConfig } from "wagmi";
import type { Connector } from "wagmi";

import { Web3AuthContext } from "./context";

// ----------------------------------------------------------------------

const SESSION_KEY = "web3Session";

export function Web3AuthProvider({ children }: { children: ReactNode }) {
  const { address, chainId, isConnected } = useConnection();
  const { mutate: wagmiConnect } = useConnect();
  const { mutate: wagmiDisconnect } = useDisconnect();
  const config = useConfig();

  useEffect(() => {
    if (isConnected && address) {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ address, chainId, connectedAt: Date.now() }),
      );
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [isConnected, address, chainId]);

  const connect = (connector: Connector) => {
    wagmiConnect({ connector });
  };

  const disconnect = () => {
    wagmiDisconnect();
    localStorage.clear();
  };

  return (
    <Web3AuthContext
      value={{
        isWeb3Authenticated: isConnected,
        address,
        chainId,
        connectors: config.connectors,
        connect,
        disconnect,
      }}
    >
      {children}
    </Web3AuthContext>
  );
}
