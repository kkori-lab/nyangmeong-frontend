const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** 날짜 묶음 분류 */
export function groupConversations(conversations, now = new Date()) {
  const groups = [
    { label: '오늘', items: [] },
    { label: '어제', items: [] },
    { label: '지난 7일', items: [] },
    { label: '이전', items: [] },
  ];

  conversations.forEach((conversation) => {
    /** 날짜 단위 차이: 시각 포함 시 어제 밤 대화가 오늘로 묶임 */
    const diffDays = Math.round(
      (startOfDay(now) -
        startOfDay(new Date(conversation.lastDt ?? conversation.regDt))) /
        DAY_MS,
    );
    const index =
      diffDays <= 0 ? 0 : diffDays === 1 ? 1 : diffDays <= 7 ? 2 : 3;
    groups[index].items.push(conversation);
  });

  return groups.filter((group) => group.items.length > 0);
}
