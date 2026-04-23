import type { Connector } from "wagmi";
import { createSafeContext } from "@/utils/createSafeContext";

// ----------------------------------------------------------------------

export interface Web3AuthContextType {
  isWeb3Authenticated: boolean;
  address: `0x${string}` | undefined;
  chainId: number | undefined;
  connectors: readonly Connector[];
  connect: (connector: Connector) => void;
  disconnect: () => void;
}

export const [Web3AuthContext, useWeb3AuthContext] =
  createSafeContext<Web3AuthContextType>(
    "useWeb3AuthContext must be used within Web3AuthProvider",
  );
