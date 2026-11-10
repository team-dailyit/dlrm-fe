// `.claude/skills`(원본)를 `.agents/skills`(Codex용 복사본)로 동기화한다.
// Windows 에서는 git 심볼릭 링크가 풀릴 수 있어 링크 대신 복사본을 커밋한다.
// 원본에서 지운 스킬이 복사본에 남지 않도록 대상 폴더를 비운 뒤 복사한다.
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, '.claude', 'skills');
const target = join(root, '.agents', 'skills');

if (!existsSync(source)) {
  console.error(`원본 폴더가 없다: ${source}`);
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
mkdirSync(dirname(target), { recursive: true });
cpSync(source, target, { recursive: true });
