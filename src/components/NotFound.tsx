import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const NotFound: React.FC = () => {
  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="mx-auto w-full max-w-[1200px] p-[13px]">
        <div className="pt-[120px] pb-[50px]">
          <p className="mb-[25px] text-[58px] leading-[1.1] font-bold sm:text-[96px] md:text-[125px]">
            🏳️ 404
            <br />
            Not Found
          </p>
          <p className="text-2xl leading-loose font-bold">
            お探しのページは見つかりませんでした。
            <br />
            システムも白旗をあげています。
          </p>
        </div>
        <div className="py-[50px]">
          <p>
            お探しのページは見つけられなかったのですが、こっちにあるかもしれないです。一応ご確認いただけますと。
          </p>
          <ul className="m-0 list-inside list-[circle] p-0 underline">
            <li>
              <a href="https://www.chuo-u.ac.jp/">中央大学</a>
            </li>
            <li>
              <a href="https://x.com/itl_marubu">Twitter</a>
            </li>
          </ul>
        </div>
        <Footer />
      </div>
    </div>
  );
};
