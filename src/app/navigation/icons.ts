import { TbPalette } from "react-icons/tb";
import { HomeIcon, BuildingStorefrontIcon, UserIcon as HiUserIcon, WalletIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { ElementType } from "react";

import DashboardsIcon from "@/assets/dualicons/dashboards.svg?react";
import SettingIcon from "@/assets/dualicons/setting.svg?react";

export const navigationIcons: Record<string, ElementType> = {
  dashboards: DashboardsIcon,
  settings: SettingIcon,
  "dashboards.home": HomeIcon,
  "settings.general": HiUserIcon,
  "settings.appearance": TbPalette,
  "dashboards.shop": BuildingStorefrontIcon,
  "dashboards.wallets": WalletIcon,
  "dashboards.rewards": TrophyIcon,
};
