export const Footer: React.FC = () => {
  return (
    <div className="mx-5 flex flex-col items-center py-[30px] md:flex-row md:justify-between">
      <p>©2026 iTL Marubu</p>
      <span className="flex gap-2.5 text-sm font-normal">
        {/* privacy/tos ルート移植後に TanStack Router の Link へ切り替える */}
        <a href="/privacy">個人情報保護方針</a>
        <a href="/tos">ご利用規約</a>
      </span>
    </div>
  );
};
