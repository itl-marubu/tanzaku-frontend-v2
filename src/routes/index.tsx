import { Footer } from "@/components/Footer";
import { Form } from "@/features/post/Form";
import { ACTIVE_MODE, IS_SAKURA } from "@/lib/activeMode";
import { MODE_CONFIG } from "@/lib/festivalMode";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div
      style={{ background: IS_SAKURA ? "#fff0f5" : "#000" }}
      className="flex min-h-screen flex-col"
    >
      <div className="mx-auto flex h-[90vh] w-full max-w-[1200px] flex-col items-center justify-center p-[13px]">
        <div
          style={{ color: IS_SAKURA ? "#3a1a2e" : "#fff" }}
          className="w-full rounded-[10px] p-5"
        >
          <h1 className="text-2xl font-bold">
            {MODE_CONFIG[ACTIVE_MODE].heading}
          </h1>
          <div>
            <Form />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
