import { RouteObject } from "react-router";

const publicRoutes: RouteObject = {
  id: "public",
  children: [
    {
      index: true,
      lazy: async () => ({
        Component: (await import("@/app/pages/landing")).default,
      }),
    },
  ],
};

export { publicRoutes };
