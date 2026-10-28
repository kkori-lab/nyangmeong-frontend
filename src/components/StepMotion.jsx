// 단계(화면)가 바뀌면 stepKey가 바뀌어 새로 그려지고, 방향에 따라 옆에서 들어오며 나타난다.
// 크기는 변하지 않는다. direction은 앞으로 가면 'forward', 되돌아가면 'back'이다
export default function StepMotion({ stepKey, direction, children }) {
  return (
    <div
      key={stepKey}
      className={`transition duration-300 ease-out starting:opacity-0 ${
        direction === 'back'
          ? 'starting:-translate-x-5'
          : 'starting:translate-x-5'
      }`}
    >
      {children}
    </div>
  );
}
