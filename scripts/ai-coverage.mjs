#!/usr/bin/env node
/**
 * [사이트 기능 전체 표] (SCR-AIM-004, 2026-11-26 사람 결정 "AI 매니저 대응 범위")
 * - 프론트 features/<도메인>/ 아래 api.js의 api 호출 + 백엔드 컨트롤러 엔드포인트·@AiTool + ai tool_prompts.yaml skip
 *   + docs/routes.md 화면 표를 한 문서(docs/ai-coverage.md)로 만든다
 * - 도메인을 늘릴 때마다 다시 돌려 표를 새로 만든다(손으로 고치지 않는다)
 * - 다른 저장소는 읽기만 한다
 *
 * 실행: node scripts/ai-coverage.mjs --backend ../backend --ai ../ai [--out docs/ai-coverage.md]
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/**
 * 일부러 대화창에서 빼는 것(사람 결정 2026-11-26). 규칙은 여기 한 곳에만 둔다
 * - methods: 없으면 모든 메서드
 * - path: 백엔드 경로(경로 변수는 {})에 맞추는 정규식
 */
const WRITES = ['POST', 'PUT', 'PATCH', 'DELETE'];
const EXCLUDES = [
  { reason: '로그인 전·인증 흐름(대화창은 로그인 뒤)', path: /^\/api\/auth(\/|$)/ },
  { reason: '로그인 전·인증 흐름(대화창은 로그인 뒤)', path: /^\/api\/email-certifications(\/|$)/ },
  { reason: '로그인 전·인증 흐름(대화창은 로그인 뒤)', methods: ['POST'], path: /^\/api\/members(\/recovery-info|\/recovery)?$/ },
  { reason: '로그인 전·인증 흐름(대화창은 로그인 뒤)', path: /^\/api\/members\/(phone|nickname)-availability$/ },
  /** 거래 단계는 탈퇴보다 먼저: cancel-request/withdraw(거래 취소 요청 철회)가 탈퇴로 잡히지 않게 */
  { reason: '다른 회원에게 가는 행동: 펫돌봄 거래 단계', methods: WRITES, path: /^\/api\/care-matches(\/|$)/ },
  { reason: '본인 계정: 탈퇴', path: /^\/api\/members\/me\/withdraw$/ },
  { reason: '본인 계정: 비밀번호 변경', path: /\/password(-verification|-reset)?(\/|$)/ },
  { reason: '본인 계정: 이메일 변경', methods: WRITES, path: /\/email(\/|$)/ },
  { reason: '본인 계정: SNS 연동', path: /\/sns-links(\/|$)/ },
  { reason: '다른 회원에게 가는 행동: 채팅', methods: WRITES, path: /^\/api\/chat/ },
  { reason: '다른 회원에게 가는 행동: 신고', methods: WRITES, path: /\/reports?(\/|$)/ },
  { reason: '다른 회원에게 가는 행동: 차단', methods: WRITES, path: /\/blocks?(\/|$)/ },
  { reason: '다른 회원에게 가는 행동: 좋아요(작성자에게 알림)', methods: WRITES, path: /\/likes(\/|$)/ },
  {
    reason: '커뮤니티 글·댓글 쓰기(사람 결정)',
    methods: WRITES,
    path: /^\/api\/(posts|comments|lost-reports|care-recruitments|community)(\/|$)/,
  },
];

/** 회원 기능이 아닌 공용 보조 API 도메인(사람 2026-11-26): 요약·후보에서 빼고 따로 싣는다 */
const SUPPORT_DOMAINS = { global: '공용 보조 API(드롭다운 코드·지역·파일 열기)' };
/** 해당 없음 행에 붙일 안내 */
const SUPPORT_NOTES = [{ path: /^\/api\/files(\/|$)/, note: '공통 규칙 b(사진·파일 보기)에서 다룸' }];

const METHODS = ['get', 'post', 'put', 'patch', 'delete'];
const ROUTES_MD = 'docs/routes.md';
const Q = "['`]";

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const at = args.indexOf(name);
  return at >= 0 && args[at + 1] ? args[at + 1] : fallback;
};
const backendDir = option('--backend');
const aiDir = option('--ai');
const outPath = option('--out', 'docs/ai-coverage.md');
if (!backendDir || !aiDir) {
  console.error('사용법: node scripts/ai-coverage.mjs --backend ../backend --ai ../ai [--out docs/ai-coverage.md]');
  process.exit(2);
}

/** 폴더 안 파일 전부(조건에 맞는 것) */
const walk = (dir, keep) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full, keep);
    return keep(full) ? [full] : [];
  });

const posix = (path) => path.split(sep).join('/');

/** 경로 변수를 {}로, 쿼리·끝 / 빼기 */
const normalize = (path) =>
  path
    .replace(/\$\{[^}]*\}/g, '{}')
    .replace(/\{[^}]*\}/g, '{}')
    .replace(/\?.*$/, '')
    .replace(/(.)\/+$/, '$1');

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

/** 1. 프론트 호출: features/<도메인>/ 아래 api.js·<이름>Api.js, admin* 폴더 제외 */
const readFrontCalls = () => {
  const root = 'src/features';
  const files = walk(root, (f) => /^(api|\w+Api)\.js$/.test(f.split(sep).pop()))
    .filter((f) => !posix(relative(root, f)).startsWith('admin'))
    .sort();
  const calls = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    /** 같은 파일의 문자열 상수(const BASE_URL = '/x') */
    const consts = {};
    const constRe = new RegExp('const\\s+([A-Z_][A-Z0-9_]*)\\s*=\\s*' + Q + '([^\'`]*)' + Q, 'g');
    for (const m of text.matchAll(constRe)) consts[m[1]] = m[2];
    const exports = [...text.matchAll(/export\s+(?:const|async function|function)\s+(\w+)/g)].map((m) => ({
      name: m[1],
      at: m.index,
    }));
    const callRe = new RegExp(
      '\\bapi\\.(' + METHODS.join('|') + ')\\(\\s*(?:' + Q + '([^\'`]*)' + Q + '|([A-Z_][A-Z0-9_]*)(?:\\s*\\+\\s*' + Q + '([^\'`]*)' + Q + ')?)',
      'g',
    );
    for (const m of text.matchAll(callRe)) {
      let path;
      if (m[2] !== undefined) path = m[2];
      else if (consts[m[3]] !== undefined) path = consts[m[3]] + (m[4] ?? '');
      else continue;
      /** `${BASE_URL}/x` 꼴 */
      path = path.replace(/^\$\{([A-Z_][A-Z0-9_]*)\}/, (all, name) => consts[name] ?? all);
      const owner = exports.filter((e) => e.at < m.index).pop();
      calls.push({
        method: m[1].toUpperCase(),
        key: m[1].toUpperCase() + ' ' + normalize('/api' + path),
        fn: owner?.name ?? '?',
        file: posix(relative('src', file)),
        line: lineOf(text, m.index),
      });
    }
  }
  /** 관리자 폴더가 아닌 곳의 관리자 호출(apiUsage·audit·batch 등)도 뺀다 */
  return calls.filter((c) => !/ \/api\/admin(\/|$)/.test(c.key));
};

/** 어노테이션 괄호 안 경로 값(value = / path = / 맨 앞 문자열) */
const mappingPath = (inside) => {
  if (inside === undefined) return '';
  const named = inside.match(/(?:value|path)\s*=\s*"([^"]*)"/);
  if (named) return named[1];
  const first = inside.match(/^\s*"([^"]*)"/);
  return first ? first[1] : '';
};

/** 2. 백엔드 엔드포인트: 컨트롤러 파일, /api/admin·/internal 제외 */
const readBackend = () => {
  const root = join(backendDir, 'src/main/java/com/nyangmeong');
  const files = walk(root, (f) => f.endsWith('Controller.java')).sort();
  const endpoints = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const domain = posix(relative(root, file)).split('/')[0];
    const classAt = text.search(/\bclass\s+\w+/);
    const base = mappingPath(text.slice(0, classAt).match(/@RequestMapping\(([^)]*)\)/)?.[1]);
    /** 메서드마다 그 앞 어노테이션 묶음: 앞 메서드 본문의 마지막 } 뒤 ~ public 앞 */
    const parts = text.slice(classAt).split(/\n(?=\s*public\s)/);
    for (let i = 1; i < parts.length; i += 1) {
      const prev = parts[i - 1];
      /** 앞 메서드 본문 끝(들여쓰기 4칸 이하의 } 줄) 뒤만: 경로의 {petSn}에 걸리지 않게 */
      const closes = [...prev.matchAll(/\n[ \t]{0,4}\}[ \t]*(?=\n)/g)];
      const head = closes.length ? prev.slice(closes.at(-1).index + closes.at(-1)[0].length) : prev;
      const m = head.match(/@(Get|Post|Put|Patch|Delete)Mapping(?:\(([^)]*)\))?/);
      if (!m) continue;
      const path = normalize(base + mappingPath(m[2]));
      if (!path.startsWith('/api') || /^\/api\/admin(\/|$)/.test(path)) continue;
      const tool = head.match(/@AiTool\(\s*name\s*=\s*"([^"]+)"\s*,\s*domain\s*=\s*"([^"]+)"\s*,\s*kind\s*=\s*AiToolKind\.(\w+)\s*\)/);
      const summary = head.match(/@Operation\([^)]*summary\s*=\s*"([^"]*)"/)?.[1] ?? '';
      endpoints.push({
        method: m[1].toUpperCase(),
        path,
        key: m[1].toUpperCase() + ' ' + path,
        domain,
        summary,
        tool: tool ? { name: tool[1], domain: tool[2], kind: tool[3] } : null,
      });
    }
  }
  return endpoints;
};

/** 3. ai tool_prompts.yaml: 맨 왼쪽 키 아래 skip: 이유 */
const readSkips = () => {
  const text = readFileSync(join(aiDir, 'data/tool_prompts.yaml'), 'utf8');
  const skips = {};
  let current = null;
  for (const line of text.split('\n')) {
    const top = line.match(/^([a-z_][a-z0-9_]*):\s*$/);
    if (top) current = top[1];
    const skip = line.match(/^\s+skip:\s*(.+)$/);
    if (skip && current) skips[current] = skip[1].trim();
  }
  return skips;
};

/** 4. docs/routes.md 1장 표(화면 ID·화면·URL·담당·AI) */
const readScreens = () => {
  const text = readFileSync(ROUTES_MD, 'utf8');
  const start = text.indexOf('\n## 1.');
  const end = text.indexOf('\n## ', start + 1);
  return text
    .slice(start, end < 0 ? undefined : end)
    .split('\n')
    .filter((l) => /^\|\s*[A-Z]{3}-\d{3}/.test(l))
    .map((l) => {
      const cells = l.split('|').slice(1, -1).map((c) => c.trim());
      return { id: cells[0], name: cells[1], url: cells[2], owner: cells[3], ai: cells[4] === '✓' };
    });
};

const excludeOf = (endpoint) =>
  EXCLUDES.find((rule) => (!rule.methods || rule.methods.includes(endpoint.method)) && rule.path.test(endpoint.path));

/** 지원 방식(안) */
const supportOf = (endpoint, skips) => {
  const rule = excludeOf(endpoint);
  if (endpoint.tool) {
    const now = endpoint.tool.kind === 'READ' ? '읽기' : '쓰기 카드';
    if (skips[endpoint.tool.name]) return { kind: '보류', text: '보류(ai skip: ' + skips[endpoint.tool.name] + ')' };
    if (rule) return { kind: '충돌', text: '충돌: 지금 ' + now + ' 도구, 결정은 뺌(' + rule.reason + ')' };
    return { kind: endpoint.tool.kind === 'READ' ? '읽기' : '카드', text: now };
  }
  if (rule) return { kind: '뺌', text: '뺌(' + rule.reason + ')' };
  return endpoint.method === 'GET'
    ? { kind: '읽기 후보', text: '읽기 후보' }
    : { kind: '카드 후보', text: '쓰기 카드 후보' };
};

const esc = (s) => String(s).replace(/\|/g, '\\|');
const code = (s) => '`' + s + '`';

const groupBy = (list, keyOf) => {
  const map = new Map();
  for (const item of list) map.set(keyOf(item), [...(map.get(keyOf(item)) ?? []), item]);
  return map;
};

const KINDS = ['읽기', '카드', '읽기 후보', '카드 후보', '뺌', '충돌', '보류'];

const build = () => {
  const calls = readFrontCalls();
  const endpoints = readBackend();
  const skips = readSkips();
  const screens = readScreens();
  const keys = new Set(endpoints.map((e) => e.key));
  const callsByKey = groupBy(calls, (c) => c.key);
  const domains = [...new Set(endpoints.map((e) => e.domain))].filter((d) => !SUPPORT_DOMAINS[d]).sort();

  const rows = endpoints
    .map((e) => ({ ...e, support: supportOf(e, skips), calls: callsByKey.get(e.key) ?? [] }))
    .sort((a, b) => a.domain.localeCompare(b.domain) || a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
  const tools = rows.filter((r) => r.tool);
  const supportRows = rows.filter((r) => SUPPORT_DOMAINS[r.domain]);

  const out = [];
  out.push('# 사이트 기능 전체 표 (AI 매니저 대화창 지원 범위)');
  out.push('');
  out.push('스크립트가 만든 파일이다. 손으로 고치지 않고 ' + code('node scripts/ai-coverage.mjs --backend ../backend --ai ../ai') + '로 다시 만든다. 일부러 빼는 규칙은 스크립트 맨 위 ' + code('EXCLUDES') + ' 한 곳에 있다(사람 결정 2026-11-26).');
  out.push('');
  out.push('- 기준: 백엔드 컨트롤러 엔드포인트(' + code('/api/admin') + '·' + code('/internal') + ' 제외)와 ' + code('@AiTool(name, domain, kind)') + ', 프론트 ' + code('features/') + ' 아래 ' + code('api.js') + '·' + code('<이름>Api.js') + '(관리자 호출 제외)의 ' + code('api') + ' 호출, ai ' + code('data/tool_prompts.yaml') + '의 ' + code('skip') + ', ' + code('docs/routes.md') + ' 1장');
  out.push('- 지원 방식(안): ' + code('@AiTool') + ' READ는 읽기, CARD는 쓰기 카드. 도구가 없는 GET은 읽기 후보, 도구가 없는 그 밖은 쓰기 카드 후보. 뺌 규칙에 걸리면 뺌. 도구가 있는데 뺌 규칙에 걸리면 충돌, ai가 일부러 싣지 않은 도구는 보류');
  out.push('- 순서(사람 결정 2026-11-26): 이 표 → 도메인별 도구 거르기(ai) → 도메인 하나 늘릴 때마다 ' + code('tool_eval') + '로 정답률·토큰을 잰 뒤 다음 도메인(백엔드 ' + code('@AiTool') + ' 추가도 도메인 단위)');
  out.push('');
  out.push('만든 날: ' + new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }));
  out.push('');
  out.push('## 1. 도메인별 요약');
  out.push('');
  out.push('| 도메인 | 전체 | ' + KINDS.join(' | ') + ' | 화면에서 부름 |');
  out.push('| --- | ' + ['전체', ...KINDS].map(() => '---:').join(' | ') + ' | ---: |');
  const total = { all: 0, called: 0 };
  KINDS.forEach((k) => (total[k] = 0));
  for (const d of domains) {
    const list = rows.filter((r) => r.domain === d);
    const counts = KINDS.map((k) => list.filter((r) => r.support.kind === k).length);
    const called = list.filter((r) => r.calls.length > 0).length;
    total.all += list.length;
    total.called += called;
    KINDS.forEach((k, i) => (total[k] += counts[i]));
    out.push('| ' + d + ' | ' + list.length + ' | ' + counts.join(' | ') + ' | ' + called + ' |');
  }
  out.push('| 합계 | ' + total.all + ' | ' + KINDS.map((k) => total[k]).join(' | ') + ' | ' + total.called + ' |');
  out.push('');
  out.push(code('@AiTool') + ' ' + tools.length + '개(READ ' + tools.filter((r) => r.tool.kind === 'READ').length + '·CARD ' + tools.filter((r) => r.tool.kind === 'CARD').length + ').');
  out.push('');

  out.push('## 2. 엔드포인트별');
  out.push('');
  for (const d of domains) {
    out.push('### ' + d);
    out.push('');
    out.push('| 메서드 | 경로 | 기능 | ' + code('@AiTool') + ' | 지원 방식(안) | 프론트 함수 |');
    out.push('| --- | --- | --- | --- | --- | --- |');
    for (const r of rows.filter((x) => x.domain === d)) {
      const fns = [...new Set(r.calls.map((c) => code(c.file) + ' ' + code(c.fn)))].join('<br>') || '화면에서 안 씀';
      const tool = r.tool ? code(r.tool.name) + ' ' + r.tool.kind : '';
      out.push('| ' + [r.method, code(r.path), esc(r.summary), tool, esc(r.support.text), fns].join(' | ') + ' |');
    }
    out.push('');
  }

  out.push('## 3. 해당 없음(공용 보조 API)');
  out.push('');
  out.push('회원 기능이 아니라 화면을 거드는 API라 1·2장의 개수와 후보에서 뺐다. 필요하면 각 도메인 도구 안에서 쓴다.');
  out.push('');
  out.push('| 도메인 | 메서드 | 경로 | 기능 | 안내 | 프론트 함수 |');
  out.push('| --- | --- | --- | --- | --- | --- |');
  for (const r of supportRows) {
    const fns = [...new Set(r.calls.map((c) => code(c.file) + ' ' + code(c.fn)))].join('<br>') || '화면에서 안 씀';
    const note = SUPPORT_NOTES.find((n) => n.path.test(r.path))?.note ?? SUPPORT_DOMAINS[r.domain];
    out.push('| ' + [r.domain, r.method, code(r.path), esc(r.summary), esc(note), fns].join(' | ') + ' |');
  }
  out.push('');

  out.push('## 4. 바로가기(화면)');
  out.push('');
  out.push(code('docs/routes.md') + ' 1장의 화면. AI ✓는 대화창이 그 화면으로 보낼 수 있는 URL(AI 라우팅 매핑 대상)이다.');
  out.push('');
  out.push('| 화면 ID | 화면 | URL | 담당 | AI 바로가기 |');
  out.push('| --- | --- | --- | --- | --- |');
  for (const s of screens) out.push('| ' + [s.id, esc(s.name), esc(s.url), esc(s.owner), s.ai ? '✓' : ''].join(' | ') + ' |');
  out.push('');
  out.push('화면 ' + screens.length + '개 중 AI 바로가기 ' + screens.filter((s) => s.ai).length + '개.');
  out.push('');

  const missing = calls.filter((c) => !keys.has(c.key));
  out.push('## 5. 백엔드에서 못 찾은 프론트 호출');
  out.push('');
  if (missing.length === 0) out.push('없음.');
  else {
    out.push('경로가 바뀌었거나 이 스크립트가 못 읽은 호출이다.');
    out.push('');
    out.push('| 메서드·경로 | 프론트 함수 |');
    out.push('| --- | --- |');
    for (const c of missing) out.push('| ' + code(c.key) + ' | ' + code(c.file + ':' + c.line) + ' ' + code(c.fn) + ' |');
  }
  out.push('');
  return { text: out.join('\n'), tools: tools.length, screens: screens.length, calls: calls.length, missing: missing.length };
};

const result = build();
writeFileSync(outPath, result.text);
console.log(outPath + ': @AiTool ' + result.tools + ', 화면 ' + result.screens + ', 프론트 호출 ' + result.calls + ', 못 찾은 호출 ' + result.missing);
