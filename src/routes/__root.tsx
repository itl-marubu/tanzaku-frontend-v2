import { NotFound } from "@/components/NotFound";
import { ACTIVE_MODE } from "@/lib/activeMode";
import { MODE_CONFIG } from "@/lib/festivalMode";
import { HeadContent, Outlet, createRootRoute } from "@tanstack/react-router";

const { eventName, itemName } = MODE_CONFIG[ACTIVE_MODE];

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: eventName },
      { name: "description", content: `iTLに${itemName}を飾りましょう!` },
    ],
  }),
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  return (
    <>
      <HeadContent />
      <Outlet />
    </>
  );
}
