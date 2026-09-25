---
name: start-task
description: JIRA 티켓의 부족한 필드를 보완하고, 브랜치를 생성/체크아웃하고 push한다. 사용자가 티켓 번호나 링크를 주며 "작업 시작"을 요청할 때 사용한다.
allowed-tools: Bash(git status:*), Bash(git branch:*), Bash(git ls-remote:*), Bash(git checkout:*), Bash(git pull:*), Bash(git push:*), mcp__atlassian__getAccessibleAtlassianResources, mcp__atlassian__getJiraIssue, mcp__atlassian__editJiraIssue, mcp__atlassian__transitionJiraIssue, mcp__atlassian__discover, mcp__atlassian__executeRead
---

# start-task

JIRA 티켓을 기반으로 작업을 시작할 준비를 한다. 티켓 보완, 브랜치 생성/push, 상태 변경 세 단계로 진행한다.

JIRA 작업은 Atlassian MCP(`.mcp.json`의 `atlassian` 서버) 도구로 한다. `getJiraIssue`, `editJiraIssue`, `transitionJiraIssue`는 바로 호출할 수 있고, 그 외 도구(아래의 `getJiraIssueTypeMetaWithFields`, `listJiraIssueTransitions` 등)는 `discover`로 찾은 뒤 `executeRead`로 호출한다.

> hotfix(`main`에서 분기하는 긴급 수정)에는 이 스킬을 쓰지 않는다. 티켓이 hotfix로 보이면 멈추고 `docs/commit-convention.md`의 hotfix 절차대로 수동 진행하도록 안내한다.

## 0단계: JIRA 연결 확인

- Atlassian MCP 도구(`getJiraIssue` 등)를 쓸 수 있는지 확인한다. `cloudId`가 필요하면 `getAccessibleAtlassianResources`로 구한다.
- 쓸 수 없으면(서버 미승인, 미인증, 권한 오류 등) **fallback 모드**로 진행한다.
  - 사용자에게 연결 방법을 안내한다: "`/mcp`에서 `atlassian`을 선택해 로그인해 주세요. 승인 창을 거절했다면 `claude mcp reset-project-choices` 후 다시 시작하면 됩니다."
  - 지금 연결하지 않겠다고 하면, 티켓 내용(제목, 설명, 기존 필드)을 붙여넣어 달라고 요청하고 그 내용으로 진행한다.
  - fallback 모드에서는 JIRA에 쓰는 작업(필드 수정, 상태 변경)을 하지 않고, 반영할 내용을 완료 보고에 정리해 사용자가 직접 입력하게 한다.

## 1단계: 티켓 필드 보완

1. `getJiraIssue`로 티켓을 조회한다.
2. 티켓에 이미 템플릿(섹션 구조)이 있다면, 섹션 제목·순서를 임의로 바꾸거나 지우지 않고 빈 섹션만 채운다. 템플릿에 없는 섹션을 새로 만들지 않는다.
3. 아래 필드가 비어있으면 채운다.
   - **상세 요구사항(Acceptance Criteria)**: 제목/설명만으로 확실한 항목은 초안으로 작성한다.
     ```
     - [ ] ~~일 때 ~~한다
     - [ ] ~~일 때 ~~한다
     ```
     판단하기 어려운 부분(엣지 케이스, 예외 처리, 화면별 동작 차이 등)은 추측해서 채우지 말고 사용자에게 질문한다. 한 번에 다 묻지 말고, 애매한 항목 위주로 짧게 인터뷰하듯 진행한다.
     - 예: "비로그인 상태에서 이 기능에 접근하면 어떻게 처리할까요?"
     - 답을 반영해 초안을 확정한 뒤 티켓에 반영한다.
   - **스토리포인트**: 작업 범위를 보고 추정한다.
4. 반영 전에 최종안(채울 필드와 값: AC, 스토리포인트 등)을 사용자에게 보여주고 승인받는다. 승인 후 `editJiraIssue`로 반영한다. Acceptance Criteria, Story Points는 커스텀 필드이므로 `getJiraIssue` 결과(부족하면 `discover` → `executeRead`로 `getJiraIssueTypeMetaWithFields` 호출)에서 필드 이름으로 실제 필드 ID(`customfield_xxxxx`)를 찾아 사용한다. 필드를 찾을 수 없으면 추측하지 말고 사용자에게 알린다.
5. 이미 채워진 필드는 덮어쓰지 않는다.
6. 제목/설명 자체가 너무 모호해서 요구사항 초안조차 잡기 어려운 경우 → 억지로 채우지 말고 먼저 질문한다.
7. 템플릿에 있는 섹션 중, 이 티켓과 무관해서 채울 필요가 없는 섹션은 비워두지 않고 "없음"이라고 적는다. 단, 상세 요구사항·스토리포인트처럼 정보가 부족해서 판단이 애매한 경우는 "없음"이 아니라 6번대로 먼저 질문한다.

## 2단계: 브랜치 생성, 체크아웃, push

**베이스 브랜치**: `develop`

**네이밍 규칙**: `docs/commit-convention.md`의 "브랜치 이름" 규칙을 읽고 따른다.

- `type`은 티켓 성격에 따라 `feat` 또는 `fix` 중에서 고른다. (hotfix는 이 스킬 범위 밖)
- `짧은-설명`은 티켓 제목을 바탕으로 만든다.

**절차**

```bash
git status   # 커밋되지 않은 변경이 있으면 사용자에게 확인
git checkout develop
git pull origin develop
git checkout -b {type}/{JIRA-번호}-{짧은-설명}
git push -u origin {type}/{JIRA-번호}-{짧은-설명}
```

**예외 처리**

- 커밋되지 않은 변경이 있는 경우 → 체크아웃 전에 멈추고 사용자에게 처리 방법을 확인받는다.
- 동일한 브랜치명이 이미 존재하는 경우 → 자동으로 넘어가지 말고 사용자에게 확인받는다.
- `develop` 브랜치가 최신 상태가 아닌 경우(pull 충돌 등) → 진행을 멈추고 알린다.
- push 실패 시(권한 문제, 네트워크 등) → 원인을 알리고 3단계(상태 변경)는 진행하지 않는다.

## 3단계: 티켓 상태 변경

브랜치 push가 성공하면 티켓 상태를 '진행중'으로 변경한다.

- `discover` → `executeRead`로 `listJiraIssueTransitions`를 호출해 가능한 전환 목록을 조회해 '진행중'(또는 In Progress)에 해당하는 전환 ID를 찾고, `transitionJiraIssue`로 변경한다.
- 해당 전환이 없거나 실패하면 사용자에게 알리고, 브랜치/push 작업 자체는 되돌리지 않는다.

## 완료 후 보고

작업 완료 시 다음을 사용자에게 요약해서 알린다.

- 보완된 티켓 필드 내용 (fallback 모드라면 "JIRA에 직접 반영할 내용"으로 정리)
- 생성 및 push된 브랜치명
- 변경된 티켓 상태 (fallback 모드라면 "직접 변경 필요")
- 다음 단계(`review-task`)를 자연스럽게 안내
