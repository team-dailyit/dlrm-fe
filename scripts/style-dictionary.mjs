/**
 * Tokens Studio (packages/tokens/) → packages/shared/src/styles/tokens.css
 *
 * $themes.json 의 테마 구조를 CSS 로 펼칩니다.
 *   - :root                → 원시(core) + light 시맨틱
 *   - [data-theme="dark"]  → dark 시맨틱만 (원시는 :root 것을 var() 로 재사용)
 *
 * dark 패스는 core 를 include(참조용)로만 불러오고, 실제 출력은 theme 파일에서
 * 온 토큰으로 필터링합니다. 안 그러면 원시 변수가 통째로 중복됩니다.
 *
 * 실행: pnpm tokens:build
 */
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';

register(StyleDictionary);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const T = (rel) => path.join(root, 'packages/tokens', rel);
const scratch = mkdtempSync(path.join(tmpdir(), 'sd-'));

const fromThemeFile = (token) =>
  path.basename(path.dirname(token.filePath)) === 'theme';

async function build({ include = [], source, dest, selector, filter }) {
  const sd = new StyleDictionary({
    include: include.map((s) => T(`${s}.json`)),
    source: source.map((s) => T(`${s}.json`)),
    preprocessors: ['tokens-studio'],
    log: { warnings: 'disabled' },
    platforms: {
      css: {
        transformGroup: 'tokens-studio',
        transforms: ['name/kebab'],
        buildPath: scratch + path.sep,
        files: [
          {
            destination: dest,
            format: 'css/variables',
            filter,
            options: {
              outputReferences: true,
              selector,
              showFileHeader: false,
            },
          },
        ],
      },
    },
  });
  await sd.buildAllPlatforms();
  return readFileSync(path.join(scratch, dest), 'utf8').trim();
}

// :root = 원시 + light 시맨틱 (한 블록)
const light = await build({
  source: ['core', 'theme/light'],
  dest: 'light.css',
  selector: ':root',
});

// [data-theme="dark"] = dark 시맨틱만 (core 는 참조용)
const dark = await build({
  include: ['core'],
  source: ['theme/dark'],
  dest: 'dark.css',
  selector: '[data-theme="dark"]',
  filter: fromThemeFile,
});

rmSync(scratch, { recursive: true, force: true });

const banner = `/**
 * 이 파일은 자동 생성됩니다. 직접 수정하지 마세요.
 * 값을 바꾸려면 Tokens Studio 에서 고쳐 export 한 뒤 \`pnpm tokens:build\` 를 실행하세요.
 * 원본: packages/tokens/ (Tokens Studio multi-file)
 */`;

writeFileSync(
  path.join(root, 'packages/shared/src/styles/tokens.css'),
  [banner, '', light, '', dark, ''].join('\n'),
  'utf8',
);
console.log('생성: packages/shared/src/styles/tokens.css');
