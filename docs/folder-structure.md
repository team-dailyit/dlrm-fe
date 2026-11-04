# 폴더 구조

## FSD 규칙

레이어 순서 (상위 → 하위): `app` → `views` → `features` → `entities` → `shared`

> - 상위 레이어는 하위 레이어를 import 가능, 역방향 import 금지 (`entities`가 `features`를 import하면 안 됨)
> - 같은 레이어끼리는 서로 import 금지 (`features/like`가 `features/comment`를 직접 참조 X)

- `app`: 앱 전역 설정 (라우터, 프로바이더, 전역 스타일)
- `views`: 라우트 단위 페이지
  - FSD 표준 이름은 `pages`지만, 프레임워크의 `pages/` 라우터 폴더 관례와 겹치지 않도록 `views`를 쓴다.
- `features`: 사용자 행동 단위 기능 (좋아요, 댓글작성, 로그인 등)
- `entities`: 비즈니스 엔티티 (user, post, comment 등 도메인 모델 + API)
- `shared`: 프로젝트 전역 공용 (ui 컴포넌트, hooks, utils, api 클라이언트)

## 폴더 구조

모노레포로 구성되어 있으며, `apps/`에 서비스와 어드민이 있고 `packages/`에 공용 코드와 도구 설정을 둔다.

```
dlrm-fe/
├── apps/
│   ├── service/              # 서비스 (React + Vite)
│   │   └── src/
│   │       ├── app/
│   │       ├── views/
│   │       ├── features/
│   │       ├── entities/
│   │       └── shared/
│   └── admin/                # 어드민 (React + Vite)
│       └── src/
│           ├── app/
│           ├── views/
│           ├── features/
│           ├── entities/
│           └── shared/
└── packages/
    ├── shared/               # 서비스/어드민 공통 공유 패키지
    │   └── src/
    │       ├── constants/    # 공유 상수
    │       ├── types/        # 공유 타입
    │       └── styles/       # 공유 스타일 (디자인 토큰 등)
    ├── eslint-config/        # 공통 ESLint 설정 (base, react)
    ├── typescript-config/    # 공통 tsconfig (base, vite-app, vite-node, library)
    └── vitest-config/        # 공통 Vitest 설정 (react)
```

- `packages/shared`는 서비스와 어드민이 공통으로 쓰는 코드(타입, 상수, 스타일 토큰 등)를 둔다. 앱 전용 코드는 각 앱의 `src/shared`에 둔다.
- `packages/*-config`는 워크스페이스가 함께 쓰는 도구 설정을 둔다. 각 워크스페이스는 이를 상속하고, 워크스페이스마다 달라지는 값(경로 alias, `tsconfigRootDir` 등)만 직접 지정한다.
