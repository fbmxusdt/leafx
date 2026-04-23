import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TagIcon,
  UsersIcon,
  TrophyIcon,
  ArrowRightIcon,
  ArrowRightEndOnRectangleIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useThemeContext } from "@/app/contexts/theme/context";
import { useWeb3AuthContext } from "@/app/contexts/web3auth/context";

// ----------------------------------------------------------------------

const NAV_LINKS = [
  { label: "Home", id: "hero" },
  { label: "Products", id: "products" },
  { label: "Rewards", id: "rewards" },
  { label: "Contact", id: "footer" },
];

const PRODUCTS = [
  {
    name: "Amaranth Tea",
    category: "Entry Rank",
    price: "20 USDT",
    crypto: "20 USDT",
    discount: "Rank 1",
    gradient: "from-[#fca5a5] to-[#f87171]",
  },
  {
    name: "Jasmine Tea",
    category: "Rising Rank",
    price: "25 USDT",
    crypto: "25 USDT",
    discount: "Rank 2",
    gradient: "from-[#fcd34d] to-[#fbbf24]",
  },
  {
    name: "Carnation Tea",
    category: "Growing Rank",
    price: "50 USDT",
    crypto: "50 USDT",
    discount: "Rank 3",
    gradient: "from-[#fde047] to-[#facc15]",
  },
  {
    name: "Marigold Tea",
    category: "Advanced Rank",
    price: "200 USDT",
    crypto: "200 USDT",
    discount: "Rank 4",
    gradient: "from-[#a3e635] to-[#84cc16]",
  },
  {
    name: "Rose Tea",
    category: "Premium Rank",
    price: "500 USDT",
    crypto: "500 USDT",
    discount: "Rank 5",
    gradient: "from-[#4ade80] to-[#22c55e]",
  },
  {
    name: "Lily Tea",
    category: "Elite Rank",
    price: "1000 USDT",
    crypto: "1000 USDT",
    discount: "Rank 6",
    gradient: "from-[#2dd4bf] to-[#14b8a6]",
  },
  {
    name: "Lavender Tea",
    category: "Master Rank",
    price: "2000 USDT",
    crypto: "2000 USDT",
    discount: "Rank 7",
    gradient: "from-[#22d3ee] to-[#06b6d4]",
  },
  {
    name: "Chrysanthemum Tea",
    category: "Grand Master",
    price: "3000 USDT",
    crypto: "3000 USDT",
    discount: "Rank 8",
    gradient: "from-[#60a5fa] to-[#3b82f6]",
  },
  {
    name: "Hibiscus Tea",
    category: "Legend Rank",
    price: "40000 USDT",
    crypto: "40000 USDT",
    discount: "Rank 9",
    gradient: "from-[#a78bfa] to-[#8b5cf6]",
  },
  {
    name: "Osmanthus Tea",
    category: "Supreme Rank",
    price: "50000 USDT",
    crypto: "50000 USDT",
    discount: "Rank 10",
    gradient: "from-[#a855f7] to-[#9333ea]",
  },
];

const REWARDS = [
  {
    icon: TagIcon,
    title: "Direct Referral",
    value: "50%",
    description: "Earn 50% commission instantly when someone you referred makes a purchase.",
    features: ["Instant payout", "No minimum order", "Tracked on-chain"],
    iconBg: "bg-indigo-100 dark:bg-indigo-900/20",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    valueColor: "text-indigo-600 dark:text-indigo-400",
    checkColor: "text-indigo-500",
    badgeColor: "primary" as const,
  },
  {
    icon: UsersIcon,
    title: "Unilevel Network",
    value: "1% × 10",
    description: "Earn 1% from 10 levels deep in your network — passive income that compounds automatically.",
    features: ["10 levels deep", "Automatic distribution", "Smart contract enforced"],
    iconBg: "bg-emerald-100 dark:bg-emerald-900/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    valueColor: "text-emerald-600 dark:text-emerald-400",
    checkColor: "text-emerald-500",
    badgeColor: "success" as const,
  },
  {
    icon: TrophyIcon,
    title: "Gifting",
    value: "50%",
    description: "Unlock deeper discounts as you climb the ranks. The more you buy and refer, the more you save.",
    features: ["10 rank tiers", "Stackable with referrals", "Lifetime status"],
    iconBg: "bg-amber-100 dark:bg-amber-900/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    valueColor: "text-amber-600 dark:text-amber-400",
    checkColor: "text-amber-500",
    badgeColor: "warning" as const,
  },
];

// ----------------------------------------------------------------------

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

// ----------------------------------------------------------------------

function Navbar() {
  const { isDark, setThemeMode } = useThemeContext();
  const { isWeb3Authenticated, disconnect, address } = useWeb3AuthContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close mobile menu on resize past lg
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <nav
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/95 shadow-soft dark:bg-gray-900/95" : "bg-transparent",
      )}
    >
      {/* Main bar — single row, no wrapping */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-4 sm:h-16">

          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
              <span className="text-sm font-bold text-white">L</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white sm:text-xl">
              LEAFX
            </span>
          </Link>

          {/* Desktop nav links — hidden below lg */}
          <div className="hidden flex-1 items-center justify-center gap-6 lg:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollTo(link.id)}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                {link.label}
              </button>
            ))}
            {isWeb3Authenticated ? (
              <Link
                to="/dashboards/home"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Dashboard
              </Link>) : ''
            }
          </div>

          {/* Right side actions */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* Dark mode toggle — always visible */}
            <button
              type="button"
              onClick={() => setThemeMode(isDark ? "light" : "dark")}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              aria-label="Toggle dark mode"
            >
              {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            {/* Wallet actions — desktop only (lg+) */}
            <div className="hidden items-center gap-2 lg:flex">
              {isWeb3Authenticated ? (
                <>
                  <Link
                    to="/dashboards/home"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-sm font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    <WalletIcon className="h-4 w-4 shrink-0" />
                    <span>{address ? shortAddress(address) : "Connected"}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => disconnect()}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  >
                    <ArrowRightEndOnRectangleIcon className="h-4 w-4 shrink-0" />
                    Disconnect
                  </button>
                </>
              ) : (
                <Button component={Link} to="/connect" color="success" className="text-sm">
                  <WalletIcon className="mr-1.5 h-4 w-4" />
                  Connect Wallet
                </Button>
              )}
            </div>

            {/* Hamburger — mobile only (below lg) */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu — slides down, scrollable if content overflows */}
      {mobileOpen && (
        <div className="max-h-[calc(100vh-56px)] overflow-y-auto border-t border-gray-100 bg-white/98 px-4 py-4 dark:border-gray-800 dark:bg-gray-900/98 lg:hidden">
          {/* Nav links */}
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => { scrollTo(link.id); setMobileOpen(false); }}
                className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="my-3 border-t border-gray-100 dark:border-gray-800" />

          {/* Wallet action */}
          {isWeb3Authenticated ? (
            <div className="flex flex-col gap-2">
              <Button
                component={Link}
                to="/dashboards/home"
                color="primary"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 font-mono text-sm font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
              >
                <WalletIcon className="h-4 w-4 shrink-0" />
                {address ? shortAddress(address) : "Connected"}
              </Button>
              <Button
                type="button"
                color="error"
                onClick={() => { disconnect(); setMobileOpen(false); }}
                className="flex items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20"
              >
                <ArrowRightEndOnRectangleIcon className="h-4 w-4 shrink-0" /> Disconnect Wallet
              </Button>
            </div>
          ) : (
            <Button
              component={Link}
              to="/connect"
              color="success"
              className="w-full justify-center"
              onClick={() => setMobileOpen(false)}
            >
              <WalletIcon className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}

// ----------------------------------------------------------------------

function HeroSection() {
  const { isWeb3Authenticated } = useWeb3AuthContext();

  return (
    <section
      id="hero"
      className="relative flex min-h-svh items-center bg-gradient-to-br from-emerald-50 via-white to-indigo-50 pt-14 sm:pt-16 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
    >
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-1/4 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl sm:h-96 sm:w-96" />
      <div aria-hidden="true" className="pointer-events-none absolute left-0 bottom-1/4 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl sm:h-96 sm:w-96" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex max-w-3xl flex-col gap-6">
          <Badge color="success" variant="soft" className="w-fit text-xs font-semibold uppercase tracking-wide">
            Blockchain-Powered Ecommerce
          </Badge>

          <h1 className="text-4xl font-extrabold leading-tight text-gray-900 dark:text-white sm:text-5xl lg:text-7xl">
            Shop Smarter.{" "}
            <span className="text-emerald-500">Earn More.</span>{" "}
            On&#8209;Chain.
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-gray-500 dark:text-gray-400 sm:text-lg">
            A fully decentralized marketplace on Binance Smart Chain. Pay with
            crypto or QR, earn from every referral, and unlock deeper discounts
            the higher you rank.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {isWeb3Authenticated ? (
              <Button component={Link} to="/dashboards/home" color="success" isGlow className="h-auto px-6 py-3 text-base">
                Go to Dashboard
                <ArrowRightIcon className="ml-2 inline h-4 w-4" />
              </Button>
            ) : (
              <Button component={Link} to="/connect" color="success" isGlow className="h-auto px-6 py-3 text-base">
                <WalletIcon className="mr-2 h-5 w-5" />
                Connect Wallet
              </Button>
            )}
            <Button
              type="button"
              onClick={() => scrollTo("products")}
              variant="outlined"
              color="neutral"
              className="h-auto px-6 py-3 text-base"
            >
              Explore Products
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 pt-4 sm:gap-12">
            {[
              { label: "Member Discount", value: "Up to 30%" },
              { label: "Direct Referral", value: "50%" },
              { label: "Network Levels", value: "10 Levels" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------

function ProductsSection() {
  return (
    <section id="products" className="bg-gray-50 py-16 dark:bg-gray-900 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10 flex flex-col items-center gap-3 text-center sm:mb-16">
          <Badge color="primary" variant="soft" className="text-xs font-semibold uppercase tracking-wide">
            Featured Products
          </Badge>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Top Picks This Week</h2>
          <p className="max-w-xl text-gray-500 dark:text-gray-400">
            Fresh, quality products delivered to your door. Pay with QRPH, crypto, or your affiliate wallet.
          </p>
        </div>

        {/* Cards — flex wrap, 1 col → 2 col → 4 col */}
        <div className="flex flex-wrap gap-4 sm:gap-6">
          {PRODUCTS.map((product) => (
            <div
              key={product.name}
              className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
            >
              <Card skin="shadow" className="flex h-full flex-col overflow-hidden">
                <div className={clsx("relative h-40 shrink-0 bg-gradient-to-br sm:h-48", product.gradient)}>
                  <Badge color="success" variant="filled" className="absolute right-3 top-3 text-xs">
                    {product.discount}
                  </Badge>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <Badge color="neutral" variant="soft" className="mb-2 w-fit text-xs">
                    {product.category}
                  </Badge>
                  <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                  <div className="mb-4 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{product.price}</span>
                    <span className="text-xs text-gray-400">{product.crypto}</span>
                  </div>
                  <Button color="primary" variant="soft" className="mt-auto w-full justify-center text-sm">
                    <ShoppingBagIcon className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center sm:mt-12">
          <Button component={Link} to="/connect" color="primary" variant="outlined">
            Shop Now
            <ArrowRightIcon className="ml-2 inline h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------

function RewardsSection() {
  return (
    <section id="rewards" className="bg-white py-16 dark:bg-gray-950 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10 flex flex-col items-center gap-3 text-center sm:mb-16">
          <Badge color="warning" variant="soft" className="text-xs font-semibold uppercase tracking-wide">
            Rewards System
          </Badge>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Earn While You Shop</h2>
          <p className="max-w-xl text-gray-500 dark:text-gray-400">
            Our blockchain-enforced affiliate system rewards you at every level — from your first referral to a 10-level deep network.
          </p>
        </div>

        {/* Cards — flex col → row */}
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          {REWARDS.map((tier) => (
            <div key={tier.title} className="min-w-0 flex-1">
              <Card skin="bordered" className="relative flex h-full flex-col overflow-hidden p-6 sm:p-8">
                <div className="pointer-events-none absolute -right-4 -top-4 select-none text-7xl font-black text-gray-900/5 dark:text-white/5 sm:text-8xl">
                  {tier.value.split("×")[0].trim()}
                </div>
                <div className={clsx("mb-5 flex h-11 w-11 items-center justify-center rounded-xl sm:mb-6 sm:h-12 sm:w-12", tier.iconBg)}>
                  <tier.icon className={clsx("h-5 w-5 sm:h-6 sm:w-6", tier.iconColor)} />
                </div>
                <p className={clsx("mb-1 text-3xl font-extrabold sm:text-4xl", tier.valueColor)}>{tier.value}</p>
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white sm:mb-3 sm:text-xl">{tier.title}</h3>
                <p className="mb-5 text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:mb-6">{tier.description}</p>
                <ul className="mt-auto space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <CheckCircleIcon className={clsx("h-4 w-4 shrink-0", tier.checkColor)} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-10 text-center text-white sm:mt-16 sm:p-10">
          <h3 className="mb-3 text-xl font-bold sm:text-2xl">Ready to build your network?</h3>
          <p className="mx-auto mb-6 max-w-lg text-sm text-emerald-100 sm:mb-8 sm:text-base">
            Connect your wallet and start earning from day one. No hidden fees — everything runs on the blockchain.
          </p>
          <Button
            component={Link}
            to="/connect"
            color="neutral"
            className="h-auto bg-white px-6 py-3 text-sm text-emerald-700 hover:bg-emerald-50 sm:px-8 sm:text-base"
          >
            <WalletIcon className="mr-2 inline h-4 w-4" />
            Join LEAFX Now
            <SparklesIcon className="ml-2 inline h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------

const FOOTER_PLATFORM = ["Products", "Rewards", "Member Ranks", "Affiliate Network"];
const FOOTER_ACCOUNT = [
  { label: "Connect Wallet", to: "/connect" },
  { label: "Dashboard", to: "/dashboards/home" },
];

function FooterSection() {
  return (
    <footer id="footer" className="bg-gray-900 text-gray-400 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Flex col on mobile, row on md+ */}
        <div className="flex flex-col gap-10 md:flex-row md:gap-12">

          {/* Brand — takes more space on desktop */}
          <div className="flex-[2_1_0%]">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                <span className="text-sm font-bold text-white">L</span>
              </div>
              <span className="text-xl font-bold text-white">LEAFX</span>
            </div>
            <p className="mb-5 max-w-xs text-sm leading-relaxed">
              A decentralized ecommerce marketplace on Binance Smart Chain.
              Shop, earn, and grow your network transparently on-chain.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge color="neutral" variant="soft" className="cursor-default text-xs">BSC Network</Badge>
              <Badge color="success" variant="soft" className="cursor-default text-xs">Blockchain Verified</Badge>
            </div>
          </div>

          {/* Platform + Account — side by side on mobile, column on md+ */}
          <div className="flex flex-row gap-8 md:flex-[1_1_0%] md:gap-12 lg:flex-[1_1_0%]">
            <div className="flex-1">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">Platform</h4>
              <ul className="flex flex-col gap-2.5 text-sm">
                {FOOTER_PLATFORM.map((item) => (
                  <li key={item}>
                    <a href="#" className="transition-colors hover:text-white">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex-1">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">Account</h4>
              <ul className="flex flex-col gap-2.5 text-sm">
                {FOOTER_ACCOUNT.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="transition-colors hover:text-white">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-gray-800 pt-8 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} LEAFX. All rights reserved.</p>
          <p>Powered by Binance Smart Chain</p>
        </div>
      </div>
    </footer>
  );
}

// ----------------------------------------------------------------------

export default function LandingPage() {
  return (
    <div data-page="landing" className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <main>
        <HeroSection />
        <ProductsSection />
        <RewardsSection />
      </main>
      <FooterSection />
    </div>
  );
}
