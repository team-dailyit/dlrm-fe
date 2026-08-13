/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'docs', 'refactor', 'style', 'perf', 'test'],
    ],
    // 한글은 대소문자 개념이 없어 기본 규칙이 오작동합니다.
    'subject-case': [0],
    'body-max-line-length': [0],
  },
};

export default config;
