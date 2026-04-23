import { useState, useEffect } from "react";
import {
  useConnection,
  useBalance,
  useReadContract,
  useWriteContract,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { erc20Abi, isAddress, parseEther, parseUnits, formatEther, formatUnits, maxUint256 } from "viem";
import { QRCodeSVG } from "qrcode.react";
import { Page } from "@/components/shared/Page";
import { Button, CopyButton } from "@/components/ui";
import { ClipboardIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955" as const;
const LEAFX_ADDRESS = "0x5951f937ff590239d38c10e871f9982359e56c36" as const;
const PANCAKE_V3_ROUTER = "0x1b81D678ffb9C0263b24A97847620C99d213eB14" as const;
const POOL_ADDRESS = "0x200410102224189d502e33a1691f13f1b872755a" as const;

const ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
        name: "params",
        type: "tuple",
      },
    ],
    name: "exactInputSingle",
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
] as const;

const POOL_ABI = [
  { name: "fee", inputs: [], outputs: [{ type: "uint24" }], stateMutability: "view", type: "function" },
  {
    name: "slot0",
    inputs: [],
    outputs: [
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "tick", type: "int24" },
      { name: "observationIndex", type: "uint16" },
      { name: "observationCardinality", type: "uint16" },
      { name: "observationCardinalityNext", type: "uint16" },
      { name: "feeProtocol", type: "uint8" },
      { name: "unlocked", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// token0=USDT, token1=LEAFX → price = (sqrtPriceX96/2^96)^2 = LEAFX per 1 USDT
function calcPrice(sqrtPriceX96: bigint): number {
  const sqrt = Number(sqrtPriceX96) / 2 ** 96;
  return sqrt * sqrt;
}

type Tab = "send" | "receive" | "swap";
type SendToken = "BNB" | "USDT" | "LEAFX";
type SwapDir = "usdt_to_leafx" | "leafx_to_usdt";

function BalanceCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 dark:border-dark-600 dark:bg-dark-700">
      <span className="text-xs text-gray-500 dark:text-dark-300">{label}</span>
      <span className="text-xl font-semibold text-gray-900 dark:text-dark-50">{value}</span>
    </div>
  );
}

export default function WalletPage() {
  const { address } = useConnection();

  const { data: bnbBal } = useBalance({ address });
  const { data: usdtBal } = useReadContract({
    address: USDT_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const { data: leaxfBal } = useReadContract({
    address: LEAFX_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: poolFee } = useReadContract({
    address: POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: "fee",
  });

  const { data: slot0 } = useReadContract({
    address: POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: "slot0",
    query: { refetchInterval: 15_000 },
  });

  // LEAFX per 1 USDT (token0=USDT, token1=LEAFX)
  const livePrice = slot0 ? calcPrice((slot0 as readonly [bigint, ...unknown[]])[0]) : null;

  const [tab, setTab] = useState<Tab>("send");

  // ── Send ────────────────────────────────────────────────────
  const [sendToken, setSendToken] = useState<SendToken>("BNB");
  const [sendTo, setSendTo] = useState("");
  const [sendAmt, setSendAmt] = useState("");

  const { mutate: sendTransaction, data: sendNativeTxHash, isPending: isSendingNative } = useSendTransaction();
  const { mutate: writeContract, data: sendTokenTxHash, isPending: isSendingToken } = useWriteContract();
  const { isPending: sendNativeConfirming, isSuccess: sendNativeDone } = useWaitForTransactionReceipt({ hash: sendNativeTxHash });
  const { isPending: sendTokenConfirming, isSuccess: sendTokenDone } = useWaitForTransactionReceipt({ hash: sendTokenTxHash });

  const handleSend = () => {
    if (!isAddress(sendTo) || !sendAmt || !address) return;
    if (sendToken === "BNB") {
      sendTransaction({ to: sendTo as `0x${string}`, value: parseEther(sendAmt) });
    } else {
      writeContract({
        address: sendToken === "USDT" ? USDT_ADDRESS : LEAFX_ADDRESS,
        abi: erc20Abi,
        functionName: "transfer",
        args: [sendTo as `0x${string}`, parseUnits(sendAmt, 18)],
      });
    }
  };

  // ── Swap ────────────────────────────────────────────────────
  const [swapDir, setSwapDir] = useState<SwapDir>("usdt_to_leafx");
  const [swapAmt, setSwapAmt] = useState("");
  const [swapStep, setSwapStep] = useState<"idle" | "approving" | "swapping">("idle");

  const tokenIn = swapDir === "usdt_to_leafx" ? USDT_ADDRESS : LEAFX_ADDRESS;
  const tokenOut = swapDir === "usdt_to_leafx" ? LEAFX_ADDRESS : USDT_ADDRESS;

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenIn,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, PANCAKE_V3_ROUTER] : undefined,
    query: { enabled: !!address },
  });

  const { mutate: writeApprove, data: approveTxHash, isPending: isApproving } = useWriteContract();
  const { mutate: writeSwap, data: swapTxHash, isPending: isSwapping } = useWriteContract();
  const { isPending: approveConfirming, isSuccess: approveDone } = useWaitForTransactionReceipt({ hash: approveTxHash });
  const { isPending: swapConfirming, isSuccess: swapDone } = useWaitForTransactionReceipt({ hash: swapTxHash });

  useEffect(() => {
    if (!approveDone || swapStep !== "approving") return;
    setSwapStep("swapping");
    refetchAllowance();
    const fee = poolFee ?? 2500;
    const amtIn = parseUnits(swapAmt, 18);
    writeSwap({
      address: PANCAKE_V3_ROUTER,
      abi: ROUTER_ABI,
      functionName: "exactInputSingle",
      args: [{ tokenIn, tokenOut, fee, recipient: address!, amountIn: amtIn, amountOutMinimum: 0n, sqrtPriceLimitX96: 0n }],
    });
  }, [approveDone]);

  useEffect(() => {
    if (!swapDone || swapStep !== "swapping") return;
    setSwapStep("idle");
    setSwapAmt("");
  }, [swapDone]);

  const handleSwap = () => {
    if (!swapAmt || !address) return;
    if (swapMaxBig !== undefined && parseUnits(swapAmt, 18) > swapMaxBig) return;
    const amtIn = parseUnits(swapAmt, 18);
    const fee = poolFee ?? 2500;
    if (allowance === undefined || (allowance as bigint) < amtIn) {
      setSwapStep("approving");
      writeApprove({ address: tokenIn, abi: erc20Abi, functionName: "approve", args: [PANCAKE_V3_ROUTER, maxUint256] });
    } else {
      setSwapStep("swapping");
      writeSwap({
        address: PANCAKE_V3_ROUTER,
        abi: ROUTER_ABI,
        functionName: "exactInputSingle",
        args: [{ tokenIn, tokenOut, fee, recipient: address, amountIn: amtIn, amountOutMinimum: 0n, sqrtPriceLimitX96: 0n }],
      });
    }
  };

  // Max swappable = tokenIn balance (USDT or LEAFX)
  const swapMaxBig = swapDir === "usdt_to_leafx"
    ? (usdtBal as bigint | undefined)
    : (leaxfBal as bigint | undefined);
  const swapMaxStr = swapMaxBig !== undefined ? formatUnits(swapMaxBig, 18) : "";

  const estimatedOut = (() => {
    if (!livePrice || !swapAmt || isNaN(Number(swapAmt))) return null;
    const amt = Number(swapAmt);
    return swapDir === "usdt_to_leafx"
      ? `≈ ${(amt * livePrice).toFixed(4)} LEAFX`
      : `≈ ${(amt / livePrice).toFixed(4)} USDT`;
  })();

  const isSendBusy = isSendingNative || isSendingToken || sendNativeConfirming || sendTokenConfirming;
  const sendSuccess = sendNativeDone || sendTokenDone;
  const isSwapBusy = isApproving || approveConfirming || isSwapping || swapConfirming;

  const fmt18 = (v: unknown) => typeof v === "bigint" ? Number(formatUnits(v, 18)).toFixed(4) : "—";

  return (
    <Page title="Wallet">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <h2 className="mb-5 text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">Wallet</h2>

        {/* Balances */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <BalanceCard label="BNB" value={bnbBal ? `${Number(formatEther(bnbBal.value)).toFixed(4)} BNB` : "—"} />
          <BalanceCard label="USDT (BEP20)" value={`${fmt18(usdtBal)} USDT`} />
          <BalanceCard label="LEAFX" value={`${fmt18(leaxfBal)} LEAFX`} />
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-dark-600 dark:bg-dark-800">
          {(["send", "receive", "swap"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-md py-2 text-sm font-medium capitalize transition-colors ${tab === t
                ? "bg-white text-primary-600 shadow-sm dark:bg-dark-600 dark:text-primary-400"
                : "text-gray-500 hover:text-gray-700 dark:text-dark-300 dark:hover:text-dark-100"
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-dark-600 dark:bg-dark-700">

          {/* SEND */}
          {tab === "send" && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-dark-300">Token</label>
                <select
                  value={sendToken}
                  onChange={(e) => setSendToken(e.target.value as SendToken)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-800 dark:text-dark-50"
                >
                  <option value="BNB">BNB</option>
                  <option value="USDT">USDT</option>
                  <option value="LEAFX">LEAFX</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-dark-300">Recipient Address</label>
                <input
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                  placeholder="0x..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-800 dark:text-dark-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-dark-300">Amount</label>
                <input
                  type="number"
                  value={sendAmt}
                  onChange={(e) => setSendAmt(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-800 dark:text-dark-50"
                />
              </div>
              {sendSuccess && <p className="text-sm text-green-600 dark:text-green-400">Transaction confirmed.</p>}
              <Button onClick={handleSend} disabled={isSendBusy || !sendTo || !sendAmt} color="primary" className="w-full">
                {isSendBusy ? "Sending…" : `Send ${sendToken}`}
              </Button>
            </div>
          )}

          {/* RECEIVE */}
          {tab === "receive" && (
            <div className="flex flex-col items-center gap-5">
              {address ? (
                <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-dark-500 dark:bg-white">
                  <QRCodeSVG value={address} size={200} />
                </div>
              ) : (
                <div className="flex h-[216px] w-[216px] items-center justify-center rounded-xl border border-gray-200 text-sm text-gray-400">
                  No address
                </div>
              )}
              <div className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-dark-500 dark:bg-dark-800">
                <span className="flex-1 truncate font-mono text-sm text-gray-800 dark:text-dark-100">
                  {address ?? "—"}
                </span>
                <CopyButton value={address ?? ""}>
                  {({ copy, copied }) => (
                    <button onClick={copy} className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-dark-200">
                      {copied
                        ? <ClipboardDocumentCheckIcon className="size-4 text-green-500" />
                        : <ClipboardIcon className="size-4" />}
                    </button>
                  )}
                </CopyButton>
              </div>
              <p className="text-xs text-gray-400 dark:text-dark-400">
                Only send BEP20 tokens (BSC network) to this address.
              </p>
            </div>
          )}

          {/* SWAP */}
          {tab === "swap" && (
            <div className="flex flex-col gap-4">
              {/* Live price banner */}
              <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-dark-800">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-gray-500 dark:text-dark-400">Live price</span>
                  {livePrice !== null ? (
                    <span className="text-sm font-semibold text-gray-800 dark:text-dark-100">
                      1 USDT = {livePrice.toFixed(4)} LEAFX
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Loading…</span>
                  )}
                </div>
                {livePrice !== null && (
                  <div className="mt-0.5 text-right text-xs text-gray-400 dark:text-dark-500">
                    1 LEAFX = {(1 / livePrice).toFixed(4)} USDT · refreshes every 15s
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-dark-300">Direction</label>
                <div className="flex gap-2">
                  {(["usdt_to_leafx", "leafx_to_usdt"] as SwapDir[]).map((dir) => (
                    <button
                      key={dir}
                      onClick={() => setSwapDir(dir)}
                      className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${swapDir === dir
                        ? "border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                        : "border-gray-300 text-gray-600 dark:border-dark-500 dark:text-dark-300"
                        }`}
                    >
                      {dir === "usdt_to_leafx" ? "USDT → LEAFX" : "LEAFX → USDT"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-600 dark:text-dark-300">
                    Amount ({swapDir === "usdt_to_leafx" ? "USDT" : "LEAFX"})
                  </label>
                  {swapMaxStr && (
                    <span className="text-xs text-gray-400 dark:text-dark-500">
                      Available: {Number(swapMaxStr).toFixed(4)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={swapAmt}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (swapMaxStr && Number(val) > Number(swapMaxStr)) return;
                      setSwapAmt(val);
                    }}
                    placeholder="0.00"
                    max={swapMaxStr || undefined}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-800 dark:text-dark-50"
                  />
                  {swapMaxStr && (
                    <button
                      onClick={() => setSwapAmt(swapMaxStr)}
                      className="rounded-lg border border-gray-300 px-3 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-dark-500 dark:text-dark-300 dark:hover:bg-dark-600"
                    >
                      Max
                    </button>
                  )}
                </div>
                {estimatedOut && (
                  <p className="mt-1 text-right text-xs text-gray-500 dark:text-dark-400">{estimatedOut}</p>
                )}
              </div>

              <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-dark-800 dark:text-dark-400">
                <div>Pool: PancakeSwap v3 · Fee: {poolFee ? `${Number(poolFee) / 10000}%` : "…"}</div>
                {swapStep === "approving" && <div className="mt-1 text-yellow-600 dark:text-yellow-400">Step 1/2: Approving token…</div>}
                {swapStep === "swapping" && <div className="mt-1 text-blue-600 dark:text-blue-400">Step 2/2: Executing swap…</div>}
                {swapDone && swapStep === "idle" && <div className="mt-1 text-green-600 dark:text-green-400">Swap confirmed.</div>}
              </div>

              <Button
                onClick={handleSwap}
                disabled={isSwapBusy || !swapAmt || (swapMaxBig !== undefined && parseUnits(swapAmt || "0", 18) > swapMaxBig)}
                color="success"
                className="w-full"
              >
                {isSwapBusy
                  ? swapStep === "approving" ? "Approving…" : "Swapping…"
                  : "Swap"}
              </Button>
            </div>
          )}

        </div>
      </div>
    </Page>
  );
}
