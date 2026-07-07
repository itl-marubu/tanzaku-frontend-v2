import { useFestivalMode } from "@/lib/activeMode";
import { Link } from "@tanstack/react-router";

export const Navbar: React.FC = () => {
  const { mode } = useFestivalMode();

  return (
    <div className="flex items-center justify-between border-b border-[#bbb] p-4 leading-normal">
      <Link to="/">
        <h1 className="text-2xl font-bold">
          {mode === "sakura" ? "iTL桜まつり" : "短冊"}
        </h1>
      </Link>
      <div className="flex items-center gap-4">
        {/* <Link to="/auth">管理者ログイン</Link> */}
      </div>
    </div>
  );
};
