import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { WalletIcon } from "@heroicons/react/24/outline";
import { useConnect, useConnection } from "wagmi";

import Logo from "@/assets/appLogo.svg?react";
import { Button, Card } from "@/components/ui";
import { Page } from "@/components/shared/Page";
import { useWeb3AuthContext } from "@/app/contexts/web3auth/context";
import { REDIRECT_URL_KEY } from "@/constants/app";

// ----------------------------------------------------------------------

function ConnectorIcon({ icon, name }: { icon?: string; name: string }) {
  if (icon) {
    return <img src={icon} alt={name} className="size-6 shrink-0" />;
  }
  return <WalletIcon className="size-6 shrink-0" />;
}

// ----------------------------------------------------------------------

export default function ConnectPage() {
  const navigate = useNavigate();
  const { connectors, connect } = useWeb3AuthContext();
  const { isConnected } = useConnection();
  const { isPending, error, variables } = useConnect();

  useEffect(() => {
    if (!isConnected) return;
    const raw = new URLSearchParams(window.location.search).get(REDIRECT_URL_KEY);
    const redirect = raw && raw !== "" && raw !== "null" && raw.startsWith("/") ? raw : "/dashboards/home";
    navigate(redirect, { replace: true });
  }, [isConnected, navigate]);

  return (
    <Page title="Connect Wallet">
      <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center">
        <div className="w-full max-w-[26rem] p-4 sm:px-5">
          {/* Header */}
          <div className="text-center">
            <Logo className="mx-auto size-16" />
            <div className="mt-4">
              <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">
                Connect Wallet
              </h2>
              <p className="text-gray-400 dark:text-dark-300">
                Connect your wallet to access LEAFX
              </p>
            </div>
          </div>

          {/* Connector list */}
          <Card className="mt-5 rounded-lg p-5 lg:p-7">
            <div className="space-y-3">
              {connectors.map((connector) => {
                const isThisConnecting =
                  isPending && (variables as any)?.connector?.uid === connector.uid;

                return (
                  <Button
                    key={connector.uid}
                    variant="outlined"
                    color="neutral"
                    className="h-12 w-full justify-start gap-3"
                    onClick={() => connect(connector)}
                    disabled={isPending}
                  >
                    {isThisConnecting ? (
                      <span className="size-6 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <ConnectorIcon icon={connector.icon} name={connector.name} />
                    )}
                    <span className="flex-1 text-left font-medium">
                      {isThisConnecting ? "Connecting…" : connector.name}
                    </span>
                  </Button>
                );
              })}
            </div>

            {error && (
              <p className="mt-4 text-center text-xs text-error-600 dark:text-error-400">
                {(error as any).shortMessage ?? error.message}
              </p>
            )}

          </Card>

          {/* Footer */}
          <div className="mt-8 flex justify-center text-xs text-gray-400 dark:text-dark-300">
            <Link
              to="/"
              className="transition-colors hover:text-gray-800 dark:hover:text-dark-100"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </Page>
  );
}
