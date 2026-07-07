import { NotFound } from "@/components/NotFound";
import { FestivalModeProvider, INITIAL_FESTIVAL_MODE } from "@/lib/activeMode";
import { MODE_CONFIG } from "@/lib/festivalMode";
import { HeadContent, Outlet, createRootRoute } from "@tanstack/react-router";

// head() はコンポーネント外（モジュール評価時）に実行されるため、ここでは
// 実行時に切り替え可能な Context ではなく初期値（env解決）のみを使う。
const { eventName, itemName } = MODE_CONFIG[INITIAL_FESTIVAL_MODE];

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
    <FestivalModeProvider>
      <HeadContent />
      <Outlet />
    </FestivalModeProvider>
  );
}
