import { Link } from "@tanstack/react-router";

export const Footer: React.FC = () => {
  return (
    <div className="mx-5 flex flex-col items-center py-[30px] md:flex-row md:justify-between">
      <p>©2026 iTL Marubu</p>
      <span className="flex gap-2.5 text-sm font-normal">
        <Link to="/privacy">個人情報保護方針</Link>
        <Link to="/tos">ご利用規約</Link>
      </span>
    </div>
  );
};
