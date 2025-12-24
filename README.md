# Eduatalk Coding Agent

Claude Agent SDK를 사용한 코딩 에이전트입니다. 코드베이스 분석, 파일 편집, 명령어 실행 등의 기능을 제공합니다.

## 요구 사항

- Node.js 18.0.0 이상
- pnpm (권장) 또는 npm
- Anthropic API 키

## 설치

```bash
# 저장소 클론
git clone <repository-url>
cd eduatalk-agent

# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env
```

`.env` 파일을 열고 Anthropic API 키를 설정합니다:

```
ANTHROPIC_API_KEY=your_api_key_here
```

API 키는 [Anthropic Console](https://console.anthropic.com/)에서 발급받을 수 있습니다.

## 사용법

### 기본 실행

```bash
# 데모 모드 (기본 프롬프트로 실행)
pnpm start

# 사용자 요청 실행
pnpm start "요청 내용"
```

### 예시

```bash
# 코드 분석
pnpm start "src 폴더의 코드를 분석해줘"

# 파일 생성
pnpm start "utils.ts 파일에 날짜 포맷 함수를 추가해줘"

# 버그 수정
pnpm start "index.ts의 에러 처리를 개선해줘"

# 테스트 실행
pnpm start "테스트를 실행하고 결과를 알려줘"
```

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `pnpm start` | 에이전트 실행 |
| `pnpm dev` | 개발 모드 (watch) |
| `pnpm typecheck` | TypeScript 타입 검사 |
| `pnpm build` | 프로덕션 빌드 |

## 프로젝트 구조

```
eduatalk-agent/
├── src/
│   └── index.ts      # 메인 에이전트 코드
├── dist/             # 빌드 출력 (빌드 후 생성)
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

## 에이전트 기능

- **코드 분석**: 코드베이스 구조 파악 및 리뷰
- **파일 편집**: 코드 수정 및 새 파일 생성
- **명령어 실행**: 빌드, 테스트 등 쉘 명령 실행
- **웹 검색**: 최신 정보 검색 및 문서 참조
- **작업 관리**: Todo 리스트를 통한 복잡한 작업 추적

## 커스터마이징

`src/index.ts`에서 에이전트 옵션을 수정할 수 있습니다:

```typescript
const agentOptions: Options = {
  // 모델 변경
  model: "claude-sonnet-4-20250514",

  // 권한 모드
  permissionMode: "default",

  // 사용할 도구 설정
  tools: {
    type: "preset",
    preset: "claude_code",
  },

  // 시스템 프롬프트 커스터마이징
  systemPrompt: `...`,
};
```

## 라이선스

MIT
