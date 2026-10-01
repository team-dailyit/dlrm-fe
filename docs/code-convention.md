# 코드 컨벤션

## 폴더/파일 구조 — FSD

- `apps/*/src` 내부는 `folder-structure.md`의 FSD 규칙을 따른다.

## 컴포넌트 작성 규칙

- 컴포넌트 함수 선언 방식: `export default function Component()`
- props 타입 정의 위치: 컴포넌트 파일 상단
- 컴포넌트 내부 코드 순서 (강제가 아닌 권장)
  - 외부 훅 → 로컬 상태 → `Ref` → 파생 상태 → 이벤트 핸들러 → `useEffect`

## 네이밍

### 파일

- 컴포넌트 파일명: React는 `PascalCase.tsx`, Next.js는 `kebab-case.tsx`
- 컴포넌트가 아닌 파일(설정, 유틸 등): `camelCase.ts(x)` (예: `router.tsx`)
- 훅 파일명: `useXxx.ts`
- barrel export 파일명: `index.ts`

### API 함수명

| 메서드     | 접두사   | 예시          |
| ---------- | -------- | ------------- |
| GET (목록) | `get`    | `getUsers`    |
| GET (단건) | `get`    | `getUserById` |
| POST       | `create` | `createUser`  |
| PUT/PATCH  | `update` | `updateUser`  |
| DELETE     | `delete` | `deleteUser`  |

- 목록 조회는 복수형(`getUsers`)을 쓴다. 단어가 이미 s로 끝나 복수형이 구분되지 않으면 `List`를 붙인다. (예: `getNewsList`, `getStatusList`)

### 기타

- 변수/함수: `camelCase`
- 상수: `UPPER_SNAKE_CASE`
- boolean 변수: `is~`, `has~`, `should~` 접두사 통일
- 이벤트 핸들러: 함수는 `handleClick`, prop은 `onClick`으로 구분
- 요청/응답 타입: 요청은 `Request`, 응답은 `Response` 접미사 사용

## TypeScript

- prop을 포함한 모든 타입은 `type`으로 통일 (`interface` 사용 금지)
- `any` 사용 금지

## React Query

### 쿼리 팩토리 패턴

쿼리용 커스텀 훅 파일을 따로 만들지 않고, 쿼리 팩토리 패턴을 사용한다.

- 위치: 해당 도메인의 `entities`에 API 함수와 함께 둔다. (예: `entities/user/api/userQueries.ts`)
- mutation은 사용자 행동 단위이므로 `features`에 둔다. (예: `features/like-place/api/`)

```tsx
export const userQueries = {
  all: () => ['users'],

  lists: () => [...userQueries.all(), 'list'],
  list: (filters: GetUsersRequest) =>
    queryOptions({
      queryKey: [...userQueries.lists(), filters],
      queryFn: () => getUsers(filters),
    }),

  details: () => [...userQueries.all(), 'detail'],
  detail: (id: string) =>
    queryOptions({
      queryKey: [...userQueries.details(), id],
      queryFn: () => getUserById(id),
      staleTime: 5 * 60 * 1000,
    }),
};

// 사용 방법
const { data } = useSuspenseQuery(userQueries.detail(userId));
```

### 쿼리키 네이밍

배열 계층 구조로 캐시 무효화 범위를 제어한다.

```
['users']                        // 유저 전체 (전체 무효화용)
['users', 'list']                // 유저 목록 전체
['users', 'list', filters]       // 특정 조건의 유저 목록
['users', 'detail']              // 유저 상세 전체
['users', 'detail', userId]      // 특정 유저
```

### 에러/로딩 처리 패턴

- Query(조회): `useSuspenseQuery` + `Suspense` / `ErrorBoundary` 사용
- Mutation(변경): `isPending`으로 로컬 처리 (버튼 비활성화 등)

## 상태 관리 기준

- 서비스 전역에서 사용하는 값 → 전역 상태 라이브러리 사용
- prop drilling이 있는 경우 → 작은 범위의 Context API 사용

---

위에 명시되지 않은 디테일한 내용은 재량에 맡긴다.
