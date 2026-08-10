# ClientOps CRM Architecture

## Runtime boundary

```mermaid
flowchart TB
  subgraph Browser
    UI["Next.js UI"]
    Login["Email / password login"]
  end

  subgraph Vercel["Vercel · Next.js runtime"]
    Proxy["proxy.ts · session refresh"]
    Pages["Server Components"]
    Actions["Server Actions"]
    CSV["CSV Route Handler"]
    DAL["requireUser / requireRole DAL"]
  end

  subgraph Supabase
    Auth["Supabase Auth"]
    RLS["PostgreSQL RLS"]
    Profiles[(profiles)]
    Customers[(customers)]
    Interactions[(interactions)]
  end

  Login --> Auth
  UI --> Proxy
  Proxy --> Pages
  Pages --> DAL
  Actions --> DAL
  CSV --> DAL
  DAL --> Auth
  DAL --> RLS
  RLS --> Profiles
  RLS --> Customers
  Customers -->|"ON DELETE CASCADE"| Interactions
```

`proxy.ts`는 세션 갱신과 비로그인 리다이렉트만 담당합니다. 데이터 접근과 mutation은 서버 DAL을 통과하며 ADMIN 전용 작업은 Server Action에서 역할을 다시 검사합니다. RLS는 우회된 요청에도 동일한 정책을 적용하는 최종 경계입니다.

## Data model

```mermaid
erDiagram
  AUTH_USERS ||--|| PROFILES : owns
  PROFILES ||--o{ INTERACTIONS : creates
  CUSTOMERS ||--o{ INTERACTIONS : has

  PROFILES {
    uuid id PK
    text email
    user_role role
  }
  CUSTOMERS {
    uuid id PK
    text name
    text phone
    text phone_normalized
    text email
    text address
    customer_status status
    timestamptz created_at
    timestamptz updated_at
  }
  INTERACTIONS {
    uuid id PK
    uuid customer_id FK
    interaction_type type
    text memo
    uuid created_by FK
    timestamptz created_at
  }
```

- 상담 기록은 추가·조회만 가능한 append-only 데이터입니다.
- 고객 영구 삭제는 ADMIN에게만 허용되며 상담 기록도 cascade 삭제됩니다.
- 전화 검색은 숫자만 남긴 `phone_normalized`를 사용해 하이픈과 공백 차이를 흡수합니다.
- 목록 RPC는 검색·상태·페이지 검증과 전체 count를 한 요청에서 제공합니다.

## Trust and secret handling

- 브라우저와 Vercel에는 publishable key만 제공합니다.
- service-role 키는 로컬 provisioning 또는 GitHub의 제한된 데모 초기화 작업에서만 사용합니다.
- 공개 signup과 비밀번호 재설정 UI는 제공하지 않습니다.
- `.env.local`, `.env.provision.local`, Supabase 임시 상태는 버전 관리에서 제외합니다.

## Delivery checks

| Layer | Check |
| --- | --- |
| Domain | Zod bounds, enum and UUID validation, phone normalization, pagination, CSV encoding |
| Database | migration, constraints, anon denial, role CRUD, STAFF delete denial, cascade |
| Browser | login, redirect, create/edit/search/filter, interaction append, CSV, role-specific delete |
| Build | ESLint, generated Next types, TypeScript, production build |
