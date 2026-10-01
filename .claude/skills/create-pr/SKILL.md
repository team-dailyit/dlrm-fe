---
name: create-pr
description: .github/pull_request_template.md 형식을 채워 PR을 생성한다. 커밋이 끝나고 리뷰 요청할 준비가 되었을 때 사용한다.
allowed-tools: Bash(gh auth status:*), Bash(git fetch:*), Bash(git branch:*), Bash(git status:*), Bash(git log:*), Bash(git diff:*), Bash(git push:*), Bash(gh pr create:*)
---

# create-pr

push → PR 생성 순서로 진행한다.

> 현재 브랜치가 `hotfix/`로 시작하면 이 스킬을 쓰지 않는다. `main`으로 향하는 PR은 `docs/commit-convention.md`의 hotfix 절차대로 수동 진행하도록 안내한다.

## 0단계: gh 확인

- `gh auth status`로 GitHub CLI 설치·로그인 여부를 확인한다.
- 설치되어 있지 않거나 로그인되어 있지 않으면 여기서 멈추고 안내한다: "`brew install gh` 후 `gh auth login`으로 로그인해 주세요."

## 1단계: push

- 커밋되지 않은 변경이 있으면 사용자에게 먼저 확인한다.
- `git status -sb`로 원격과의 차이를 확인한다. (`start-task`에서 이미 push했으므로 원격 브랜치는 보통 존재한다)
  - 원격 브랜치가 없으면 `git push -u origin <브랜치>`
  - 로컬이 앞서 있으면(`ahead`) `git push`
  - 원격이 앞서 있거나 갈라졌으면(`behind`/`diverged`) push하지 않고 멈춘 뒤 사용자에게 알린다. (force push 금지)

## 2단계: PR 생성

먼저 `git fetch origin develop`으로 최신화하고, `git log origin/develop..HEAD`, `git diff origin/develop...HEAD`로 이 브랜치의 커밋과 변경 내용을 파악한다. 제목과 본문은 이 내용을 바탕으로 작성한다.

PR을 만들기 전에 제목, 라벨, 본문을 사용자에게 미리보기로 보여주고 승인을 받는다. 수정 요청이 있으면 반영해서 다시 보여주고, 승인 후에 `gh pr create`를 실행한다.

`gh pr create`는 non-interactive 모드에서 템플릿을 자동으로 불러오지 않으므로, `.github/pull_request_template.md`를 직접 읽어 그 구조 그대로 heredoc으로 body를 채워 넘긴다.

```bash
gh pr create \
  --title "<prefix>: <변경 요약>" \
  --assignee @me \
  --base develop \
  --label "<영역 라벨, 여러 개면 쉼표로 구분>" \
  --body "$(cat <<'EOF'
<.github/pull_request_template.md의 섹션 구조를 그대로 유지하며 채운 내용>
EOF
)"
```

- 제목 형식은 `docs/commit-convention.md`의 PR 제목 규칙을 읽고 따른다 (`prefix: 커밋 내용`).
- 템플릿의 섹션 제목, 순서, 안내 주석(placeholder, HTML 주석 등)을 임의로 지우거나 바꾸지 않는다.
- 채울 내용이 없는 섹션은 비워두지 않고 "없음"이라고 적는다.
- 리뷰어가 읽기 쉽게 리스트 형식, 경어체로 작성한다.
- 라벨: `docs/commit-convention.md`의 라벨 규칙을 읽고 따른다. 바뀐 파일 위치로 영역 라벨(`service` / `admin` / `common`)을 정하고, 변경 범위가 사소하지 않으면 `needs review`도 추가한다.

### 본문 작성 규칙

공통

- diff를 보면 알 수 있는 내용은 쓰지 않는다. 함수·props·상태 이름을 나열하거나 타입 정의를 옮겨 적지 않는다.
- 화살표(→)나 명사 나열 대신 완결된 문장으로 쓴다.
- 리스트 중첩은 1단계까지.
- 코드 표기(``)는 리뷰어가 검색하거나 찾아가야 할 이름에만 쓴다.

요약

- 1문장. 사용자(서비스 이용자, 어드민 운영자, 다른 개발자) 입장에서 달라지는 점을 중심으로 쓰고, 그 변화를 만드는 핵심 컴포넌트·훅 이름은 하나 정도 함께 짚어도 된다.
  - 예: "`useNearbyPlaces` 훅과 `PlaceList` 컴포넌트를 추가했습니다"(X) → "`useNearbyPlaces` 훅을 추가해서, 지도를 움직이면 현재 영역의 주변 장소 목록이 갱신됩니다"(O)

작업 내용

- 한 줄에 한 가지 변화.
- 각 줄에 "무엇을 만들었나 + 그래서 무엇이 달라지나"를 함께 쓴다. 만든 것은 핵심 이름 하나(컴포넌트·훅 이름 수준)로만 짚는다.
  - 예: "`ApiErrorBoundary`를 추가해서, 페이지를 감싸기만 하면 API 실패 시 공통 에러 화면이 보입니다"
- 다른 개발자가 앞으로 코드를 쓰는 방식이 바뀌는 것을 먼저 쓴다.
- 의존성 추가, 문서 수정 같은 부수 변경은 한 줄로 묶거나 생략한다.
- 테스트는 무엇을 검증했는지 한 줄로 쓴다. 케이스가 많아도 표를 만들지 않는다.

스크린샷 (선택)

- 이미지는 사용자가 직접 첨부하므로, 넣을 자리와 설명만 채워 둔다.
- UI 변경이 없으면 "없음"이라고 적는다.

리뷰어 공유사항

- 중요한 순서로 쓴다.
- 넣는 것: 특정 사람의 확인이 필요한 것, 리뷰어가 동의하지 않을 수 있는 결정, 이 PR로 생긴 후속 과제.
- 넣지 않는 것: 구현하다 겪은 과정, 이 PR에 포함되지 않은 변경, 질문이 오면 답하면 되는 방어적 설명.

## 완료 후

- 생성된 PR URL을 사용자에게 보여준다.
- UI 변경이 있는 작업이면, 스크린샷 첨부를 권하고 캡처를 도울지 사용자에게 한 번 묻는다. 자동으로 캡처하지 않는다.
  - 원하면 dev 서버를 띄우고, 변경된 화면의 URL을 사용자에게 확인받은 뒤 `npx playwright screenshot <URL> <파일명>.png`로 캡처해 전달한다.
  - 캡처가 실패하거나(브라우저 미설치, 지도 로딩, 로그인 필요 등) 결과가 부정확하면 무리하게 재시도하지 말고, 사용자가 직접 캡처하도록 안내한다.
  - 사용자는 이를 확인 후 필요 시 PR 스크린샷 섹션에 직접 첨부한다.
