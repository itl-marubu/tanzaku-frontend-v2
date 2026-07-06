import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/")({
  component: AuthPage,
});

function AuthPage() {
  return (
    <div>
      <h1 className="bg-[#cfe031] px-5 py-10 text-[2rem] font-bold">
        管理者 ログイン
      </h1>
      <div className="mx-auto w-full max-w-[1280px] px-4 py-5">
        <div className="flex flex-wrap gap-2">
          <Link
            to="/auth/google"
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-black px-4 py-2 hover:bg-[#f0f0f0]"
          >
            <IconBrandGoogleFilled />
            Googleでログイン
          </Link>
        </div>
      </div>
    </div>
  );
}
