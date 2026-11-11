import { useOpenMain } from './aiHost';
import { shortcutChips } from './shortcutChips';

/** 환영 메시지 */
export default function WelcomeMessage({ nickname, petNm }) {
  const openMain = useOpenMain();
  return (
    <section className="mx-auto flex max-w-[820px] flex-col items-center gap-4 text-center">
      <div>
        <h2 className="text-[22px] font-bold text-[#1a3234]">
          안녕하세요, {nickname}님!
        </h2>
        <p className="mt-1 text-base text-[#566465]">
          {petNm ?? '반려동물'}에 대해 궁금한 걸 물어보거나, 아래에서 바로
          이동할 수 있어요.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {shortcutChips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            className="h-9 rounded-full border border-[#e2e7e7] bg-white px-4 text-base text-[#3d4a4b] hover:bg-[#f4f6f6]"
            onClick={() => openMain(chip.path)}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </section>
  );
}
