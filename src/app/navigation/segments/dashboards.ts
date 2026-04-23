import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

const ROOT_DASHBOARDS = "/dashboards";

const path = (root: string, item: string) => `${root}${item}`;

export const dashboards: NavigationTree = {
  ...baseNavigationObj["dashboards"],
  type: "root",
  childs: [
    {
      id: "dashboards.home",
      path: path(ROOT_DASHBOARDS, "/home"),
      type: "item",
      title: "Home",
      transKey: "nav.dashboards.home",
      icon: "dashboards.home",
    },
    {
      id: "dashboards.shop",
      path: path(ROOT_DASHBOARDS, "/shop"),
      type: "item",
      title: "Shop",
      transKey: "nav.dashboards.shop",
      icon: "dashboards.shop",
    },
    {
      id: "dashboards.wallets",
      path: path(ROOT_DASHBOARDS, "/wallets"),
      type: "item",
      title: "Wallet",
      transKey: "nav.dashboards.wallets",
      icon: "dashboards.wallets",
    },
    {
      id: "dashboards.rewards",
      path: path(ROOT_DASHBOARDS, "/rewards"),
      type: "item",
      title: "Rewards",
      transKey: "nav.dashboards.rewards",
      icon: "dashboards.rewards",
    },
  ],
};
