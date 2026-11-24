/**
 * crypto.randomUUID는 보안 연결(HTTPS·localhost)에서만 있다.
 * 휴대폰으로 개발 서버에 접속하면(http://PC-IP:5173) 없어서 가입·채팅·가계부 등 이 값을 쓰는 화면이 그리자마자 멈춘다(2026-11-24 iPhone 확인).
 * 없을 때만 crypto.getRandomValues(보안 연결이 아니어도 있음)로 같은 형식(UUID v4)을 만들어 채운다. main.jsx가 가장 먼저 불러온다
 */
if (typeof crypto !== 'undefined' && typeof crypto.randomUUID !== 'function') {
  crypto.randomUUID = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // 버전 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 변형
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0'));
    return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
  };
}
