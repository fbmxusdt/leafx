import { createConfig, http, fallback } from "wagmi";
import { bsc, bscTestnet } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { defineChain } from "viem";

// Local Hardhat network for dev testing
export const hardhatLocal = defineChain({
  id: 31337,
  name: "Hardhat Local",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["http://127.0.0.1:8545"] } },
});

const projectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "3114629b3157317b0cf3be442a510ede";

// BSC RPC fallback pools — rank:false = round-robin, avoids extra probe calls
const BSC_MAINNET_RPCS = fallback(
  [
    http(import.meta.env.VITE_BSC_RPC_URL || "https://bsc-dataseed.binance.org/"),
    http("https://bsc-rpc.publicnode.com"),
    http("https://bsc-dataseed1.defibit.io/"),
    http("https://bsc-dataseed1.ninicoin.io/"),
    http("https://bsc-dataseed2.defibit.io/"),
    http("https://bsc-dataseed3.defibit.io/"),
  ],
  { rank: false },
);

const BSC_TESTNET_RPCS = fallback(
  [
    http("https://data-seed-prebsc-1-s1.binance.org:8545/"),
    http("https://data-seed-prebsc-2-s1.binance.org:8545/"),
    http("https://data-seed-prebsc-1-s2.binance.org:8545/"),
  ],
  { rank: false },
);

export const wagmiConfig = createConfig({
  chains: [bsc, bscTestnet, hardhatLocal],
  connectors: [
    injected(),
    walletConnect({ projectId }),
  ],
  transports: {
    [bsc.id]: BSC_MAINNET_RPCS,
    [bscTestnet.id]: BSC_TESTNET_RPCS,
    [hardhatLocal.id]: http("http://127.0.0.1:8545"),
  },
});

export { bsc, bscTestnet };
