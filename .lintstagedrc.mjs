/**
 * ESLint 는 config 를 cwd 기준으로 찾습니다.
 * 루트에는 config 가 없으므로 각 워크스페이스 디렉터리에서 실행해야 합니다.
 */
const eslintFix = (ws) => (files) =>
  `pnpm --filter ${ws} exec eslint --fix --max-warnings 0 ${files.join(' ')}`;

const LINTED = '{ts,tsx,mts,cts,js,mjs,cjs}';

export default {
  [`apps/service/**/*.${LINTED}`]: ['prettier --write', eslintFix('service')],
  [`apps/admin/**/*.${LINTED}`]: ['prettier --write', eslintFix('admin')],
  [`packages/shared/**/*.${LINTED}`]: ['prettier --write', eslintFix('shared')],

  // 워크스페이스 밖(루트 설정 파일)은 ESLint 대상이 아니라 포맷만 합니다.
  [`*.${LINTED}`]: ['prettier --write'],
  '**/*.{json,md,css,scss,yaml,yml,html}': ['prettier --write'],
};
