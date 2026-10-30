import aiCharacter from '@/assets/ai-character.png';

// 나타날 때 서서히 떠오른다(starting: 처음 그려질 때의 값). 움직임 줄이기 설정이면 바로 보인다
export default function AiErrorGuide({ message }) {
  return (
    <aside
      aria-hidden="true"
      className="mt-2 flex items-start gap-2 transition-[opacity,translate] duration-300 ease-out max-[1100px]:basis-full starting:translate-y-1 starting:opacity-0 motion-reduce:transition-none"
    >
      <img src={aiCharacter} alt="" className="mt-1 w-10 shrink-0" />
      <div className="flex-1 rounded-box border border-danger bg-white px-4 py-3 leading-6 text-danger shadow-depth-sm">
        <small className="mb-0.5 block text-sm font-semibold text-subtle">
          AI 매니저
        </small>
        {message}
      </div>
    </aside>
  );
}
