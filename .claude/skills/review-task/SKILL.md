---
name: review-task
description: 검증(format/lint/typecheck/test/build)을 먼저 실행한 뒤, Standards(컨벤션 준수)와 Spec(티켓 요구사항 충족) 두 축으로 나누어 병렬 서브에이전트로 리뷰하고 결과를 나란히 보고한다. 개발이 끝났거나 리뷰 반영 후 재검증이 필요할 때 사용한다.
allowed-tools: Bash(git fetch:*), Bash(git diff:*), Bash(git log:*), Bash(git rev-parse:*), Bash(git merge-base:*), Bash(git ls-files:*), Bash(pnpm format:check:*), Bash(pnpm lint:*), Bash(pnpm typecheck:*), Bash(pnpm build:*), Bash(pnpm test:*), Bash(git branch:*), mcp__atlassian__getAccessibleAtlassianResources, mcp__atlassian__getJiraIssue, Agent
---

# review-task

검증과 코드 리뷰를 순서대로 진행한다. 검증이 실패하면 리뷰는 진행하지 않는다.

> 현재 브랜치가 `hotfix/`로 시작하면 `develop` 기준으로 비교하지 않는다. 사용자에게 기준점(`main`)을 확인받은 뒤 진행한다.

## 1단계: 검증

CI(`.github/workflows/ci.yaml`)와 같은 명령을 같은 순서로 실행한다. 하나라도 실패하면 즉시 중단한다.

1. `pnpm format:check`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm test`
5. `pnpm build`

**실패 시**

- 리뷰를 진행하지 않는다.
- 어떤 단계에서, 어떤 에러가 났는지 정리해서 보고한다.
- 수정 방향을 제안할 수 있으면 제안하되, 임의로 코드를 고치지 않고 사용자 확인을 받는다.

## 2단계: 비교 기준점 고정

리뷰는 커밋 전에 실행되므로, 커밋된 변경과 커밋되지 않은 변경(새 파일 포함)을 모두 대상으로 한다.

- 사용자가 기준점(브랜치, 커밋 등)을 지정했으면 그것을 쓴다. 지정하지 않았으면 `git fetch origin develop`으로 최신화한 뒤 `origin/develop`을 기준점으로 삼는다. (로컬 `develop`은 오래되었을 수 있으므로 쓰지 않는다)
- `git rev-parse <기준점>`으로 기준점이 유효한지 확인한다.
- `git merge-base <기준점> HEAD`로 분기 지점(`<base>`)을 구한다.
- 리뷰 대상을 고정한다.
  - diff: `git diff <base>` (분기 지점 ↔ 현재 작업 트리. 커밋 + 미커밋 변경 모두 포함)
  - 새 파일: `git ls-files --others --exclude-standard` (diff에 안 잡히므로 목록을 따로 넘겨 파일 전체를 읽게 한다)
  - 커밋 목록: `git log <base>..HEAD --oneline`
- 기준점이 유효하지 않거나 diff와 새 파일이 모두 비어있으면 여기서 멈추고 사용자에게 알린다. (서브에이전트 두 개를 띄운 뒤 실패하는 것보다 미리 걸러낸다)

## 3단계: 근거 자료 확인

**Standards 근거**

아래 문서를 읽고, 4단계에서 Standards 서브에이전트 프롬프트에 전체 내용을 담는다.

- `docs/code-convention.md`
- `docs/folder-structure.md`
- `docs/glossary.md` (도메인 용어 확인용)
- 문서가 커버하지 못하는 부분은 아래 **스멜 baseline**을 판단 기준(heuristic)으로 사용한다.
  - 단, 문서화된 컨벤션이 baseline과 충돌하면 문서가 우선한다.
  - 린트/포매터가 이미 강제하는 항목은 스멜로 다시 지적하지 않는다.

**Spec 근거**

- 현재 브랜치명에서 JIRA 티켓 번호를 파싱하고, Atlassian MCP의 `getJiraIssue`로 해당 티켓의 상세 요구사항(Acceptance Criteria, `start-task`에서 작성됨)을 가져온다.
- Atlassian MCP를 쓸 수 없으면(미승인, 미인증 등) `/mcp`에서 `atlassian` 로그인을 안내하고, 지금 연결하지 않겠다고 하면 AC를 붙여넣어 달라고 요청한다.
- 티켓을 찾을 수 없으면 사용자에게 스펙 출처를 묻는다. 스펙이 아예 없다고 답하면, Spec 서브에이전트는 생략하고 "스펙 없음"으로 보고한다.

## 4단계: 두 서브에이전트 병렬 실행

하나의 메시지에서 `Agent` 도구를 두 번 호출해 **동시에** 실행한다. 서로의 컨텍스트를 오염시키지 않기 위해서다.

두 서브에이전트 프롬프트 모두 한국어로 작성하고, 끝에 "보고는 반드시 한국어로 작성할 것. 코드, 파일 경로, 규칙·스멜 이름(예: Feature Envy)은 원문 그대로 둔다."를 포함한다.

**Standards 서브에이전트 프롬프트에 포함할 것**

- diff 명령, 새 파일 목록, 커밋 목록
- `code-convention.md` + `folder-structure.md` + `glossary.md` 전체 내용 + 아래 스멜 baseline 전체 (서브에이전트는 이 대화의 컨텍스트를 물려받지 않으므로, 판단 근거는 프롬프트에 모두 담는다)
- 지시: "파일/hunk 단위로 (a) 문서화된 컨벤션 위반 사항 — 어떤 규칙을 어겼는지 인용, (b) baseline 스멜 — 이름과 해당 hunk 인용, 을 보고할 것. 확정 위반(문서화된 컨벤션)과 판단성 지적(스멜)을 구분할 것. 스멜은 항상 판단성 지적이며, 문서화된 규칙이 스멜보다 우선한다. 린트가 이미 강제하는 건 생략. 반드시 고쳐야 하는 것과 제안 수준을 구분해서 정리."
- 추가 확인 지시: "(c) 새로운 도메인 용어가 코드에 등장했는데 `glossary.md`에 없거나 다른 이름으로 쓰였으면 보고할 것. (d) 새로운 환경 변수를 추가했는데 `.env.example`에 키가 없으면 보고할 것 (실제 값은 넣지 않고 키만)."

**Spec 서브에이전트 프롬프트에 포함할 것**

- diff 명령, 새 파일 목록, 커밋 목록
- 티켓의 Acceptance Criteria 전문
- 지시: "(a) 스펙에서 요구했지만 누락/일부만 구현된 것, (b) 요구하지 않았는데 추가된 동작(scope creep), (c) 구현된 것처럼 보이지만 잘못 구현된 것을 보고할 것. 항목마다 해당 요구사항을 인용."

스펙이 없으면 Spec 서브에이전트는 생략하고 최종 보고서에 그 사실을 명시한다.

## 5단계: 취합 및 보고

- 최종 보고는 한국어로 작성한다. 서브에이전트 결과가 영어로 왔다면 한국어로 옮겨서 보여준다.

- `## Standards`, `## Spec` 두 섹션으로 나누어 그대로(또는 가볍게 정리해서) 보여준다. **두 축을 합치거나 순위를 다시 매기지 않는다** — 컨벤션은 지켰지만 스펙을 놓친 경우와, 스펙은 맞췄지만 컨벤션을 어긴 경우를 구분해서 보여주기 위함이다.
- 마지막에 축별 한 줄 요약(발견 건수, 축 내에서 가장 심각한 이슈)을 덧붙인다. 두 축을 가로질러 "가장 심각한 문제 1개"를 뽑지 않는다.

## 완료 후

- 검증 통과 + 리뷰 완료 상태를 요약해서 보고한다.
- 지적 사항이 있었다면 반영 후 다시 이 스킬을 가볍게 통과시키는 것을 권장한다.

---

## 스멜 baseline (Fowler, _Refactoring_ 3장 기준)

문서화된 컨벤션이 다루지 않는 영역에 적용하는 보조 판단 기준. 항상 hard violation이 아닌 판단성 지적이다.

- **Mysterious Name** — 함수/변수/타입 이름이 뭘 하는지 드러내지 않음 → 이름을 바꾼다. 좋은 이름이 안 떠오르면 설계 자체가 불명확한 신호.
- **Duplicated Code** — 같은 로직 형태가 여러 곳에 반복됨 → 공통 부분을 추출해서 양쪽에서 호출.
- **Feature Envy** — 한 메서드가 자기 데이터보다 다른 객체 데이터를 더 많이 다룸 → 그 데이터가 있는 쪽으로 메서드를 옮긴다.
- **Data Clumps** — 같은 필드/파라미터 묶음이 계속 같이 다님 → 하나의 타입으로 묶는다.
- **Primitive Obsession** — 도메인 개념인데 원시 타입/문자열로만 표현됨 → 전용 타입을 만든다.
- **Repeated Switches** — 같은 타입에 대한 switch/if-분기가 여러 곳에서 반복됨 → 다형성이나 공유 맵으로 대체.
- **Shotgun Surgery** — 하나의 논리적 변경이 여러 파일에 흩어진 수정을 강제함 → 함께 바뀌는 것들을 한 모듈로 모은다.
- **Divergent Change** — 하나의 파일/모듈이 서로 다른 이유로 계속 수정됨 → 이유별로 모듈을 분리.
- **Speculative Generality** — 지금 스펙에 없는 미래 대비용 추상화/파라미터/훅 → 지운다. 실제 필요가 생기면 그때 다시 추가.
- **Message Chains** — `a.b().c().d()`처럼 긴 체이닝에 호출부가 의존함 → 첫 객체의 메서드 하나로 감춘다.
- **Middle Man** — 대부분 위임만 하는 클래스/함수 → 걷어내고 실제 대상을 직접 호출.
- **Refused Bequest** — 상속받은 것 대부분을 무시하거나 오버라이드하는 서브클래스 → 상속 대신 조합(composition) 사용.
