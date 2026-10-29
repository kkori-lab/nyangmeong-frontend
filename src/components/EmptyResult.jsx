/** 결과 없음 박스: 문구, 보조 문구, 아래 버튼(children)을 가운데 쌓기 */
export default function EmptyResult({ icon, title, description, children }) {
  return (
    <div className="rounded-[14px] border border-[#e2e7e7] bg-white px-6 py-14">
      <div className="flex h-[320px] flex-col items-center justify-center gap-8 text-center">
        <div className="flex flex-col items-center gap-2 text-[#566465]">
          {icon}
          <p className="text-lg">{title}</p>
          {description && <p className="text-base">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
