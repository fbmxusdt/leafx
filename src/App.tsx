// Import Dependencies
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

// Local Imports
import { AuthProvider } from "@/app/contexts/auth/Provider";
import { Web3AuthProvider } from "@/app/contexts/web3auth/Provider";
import { BreakpointProvider } from "@/app/contexts/breakpoint/Provider";
import { LocaleProvider } from "@/app/contexts/locale/Provider";
import { SidebarProvider } from "@/app/contexts/sidebar/Provider";
import { ThemeProvider } from "@/app/contexts/theme/Provider";
import { wagmiConfig } from "@/configs/wagmi";
import router from "./app/router/router";

// ----------------------------------------------------------------------

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <AuthProvider>
          <ThemeProvider>
            <LocaleProvider>
              <BreakpointProvider>
                <SidebarProvider>
                  <Web3AuthProvider>
                    <RouterProvider router={router} />
                  </Web3AuthProvider>
                </SidebarProvider>
              </BreakpointProvider>
            </LocaleProvider>
          </ThemeProvider>
        </AuthProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;
