# 커밋 컨벤션

## 브랜치 전략

브랜치 모델: **Git Flow** (릴리즈 브랜치 제외)

| 브랜치     | 용도                                  |
| ---------- | ------------------------------------- |
| `main`     | 운영 서버 배포 브랜치                 |
| `develop`  | 개발 서버 배포 브랜치                 |
| `feat/*`   | 기능 브랜치                           |
| `fix/*`    | 버그 수정 브랜치                      |
| `hotfix/*` | 긴급 버그 수정 브랜치 (main에서 바로) |

### 브랜치 이름

형식: `{type}/{JIRA-번호}-{짧은-설명}`

- `type`: `feat`, `fix`, `hotfix`
- `짧은-설명`: kebab-case, 영문, 3~5단어 이내
- 예시: `feat/FE-123-nearby-search`, `fix/FE-145-marker-overlap`
- JIRA 번호는 스킬(`review-task`)이 티켓을 찾는 데 쓰이므로 생략하지 않는다.

### hotfix

- `main`에서 분기하고, PR도 `main`으로 보낸다.
- 스킬 사용 범위
  - `start-task`, `create-pr`: `develop` 기준으로 동작하므로 쓰지 않는다. 브랜치 생성과 PR 생성은 수동으로 진행한다.
  - `review-task`: `main`을 기준점으로 비교해 쓸 수 있다.
  - `commit-changes`: 브랜치와 무관하게 동작하므로 그대로 쓸 수 있다.

## 커밋 컨벤션

### 타입

기본적으로 Conventional Commits를 따르며, 아래 prefix만 사용한다.

`feat` `fix` `chore` `docs` `refactor` `style` `perf` `test`

### 작성 규칙

- 제목 형식: `prefix: 커밋 내용`
- 본문은 필수 아님
- 커밋 메시지에 JIRA 티켓 번호를 넣지 않는다. (브랜치명에 이미 있으므로)

## PR 가이드

### 제목 규칙

커밋 컨벤션과 동일한 타입을 사용한다.

- 제목 형식: `prefix: 커밋 내용`

**예시**

- feat: 주변 장소 검색 API 연동
- fix: 마커 겹침 현상 수정

### 라벨

라벨은 PR 제목으로 알 수 없는 정보(변경 영역, 리뷰 필요 여부)에만 쓴다. 타입(`feat`, `fix` 등)은 PR 제목 prefix로 구분하므로 라벨로 붙이지 않는다.

**영역 라벨**: 바뀐 파일 위치로 정한다. 여러 위치를 바꿨으면 해당 라벨을 모두 붙인다.

| 라벨      | 변경 위치                                                          |
| --------- | ------------------------------------------------------------------ |
| `service` | `apps/service`                                                     |
| `admin`   | `apps/admin`                                                       |
| `common`  | 그 외 (`packages/shared`, 루트 설정, `docs`, `.claude`, `.github`) |

**리뷰 라벨**

| 라벨           | 의미                                              |
| -------------- | ------------------------------------------------- |
| `needs review` | 리뷰 필요 (없으면 간단한 변경이라 확인만 하면 됨) |

### PR 템플릿

`.github/pull_request_template.md` 참고
