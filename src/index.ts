/**
 * Eduatalk Coding Agent
 *
 * Claude Agent SDK를 사용한 코딩 에이전트입니다.
 * 코드베이스 분석, 파일 편집, 명령어 실행 등의 기능을 제공합니다.
 */

import { query, type Options, type SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import * as readline from "readline";

// 세션 상태
let isFirstQuery = true;
let totalCost = 0;
let totalDuration = 0;

// 에이전트 옵션 생성 함수
function createAgentOptions(continueSession: boolean): Options {
  return {
    // 모델 설정
    model: "claude-sonnet-4-20250514",

    // 권한 모드: 기본값 사용
    permissionMode: "default",

    // 사용할 도구 프리셋
    tools: {
      type: "preset",
      preset: "claude_code",
    },

    // 세션 유지 (첫 번째 쿼리가 아닌 경우)
    continue: continueSession,

    // 시스템 프롬프트
    systemPrompt: `당신은 전문 코딩 에이전트입니다.

## 역할
- 코드 분석 및 리뷰
- 버그 수정 및 코드 개선
- 새로운 기능 구현
- 테스트 작성 및 검증

## 행동 지침
1. 코드를 수정하기 전에 먼저 관련 파일을 읽고 이해하세요.
2. 변경 사항을 명확하게 설명하세요.
3. 모범 사례와 프로젝트 컨벤션을 따르세요.
4. 필요한 경우 테스트를 실행하여 변경 사항을 검증하세요.`,
  };
}

/**
 * 에이전트 실행 함수
 */
async function runAgent(prompt: string, showHeader = true): Promise<boolean> {
  if (showHeader) {
    console.log("\n" + "─".repeat(50));
  }

  try {
    // query 함수로 에이전트 실행 (스트리밍 모드)
    const options = createAgentOptions(!isFirstQuery);
    const stream = query({ prompt, options });

    // 스트림 이벤트 처리
    for await (const message of stream) {
      handleMessage(message);
    }

    // 첫 번째 쿼리 완료 후 세션 유지 활성화
    isFirstQuery = false;

    console.log("\n" + "─".repeat(50));
    return true;
  } catch (error) {
    console.error("\n❌ 에이전트 실행 중 오류 발생:", error);
    return false;
  }
}

/**
 * 메시지 처리 함수
 */
function handleMessage(message: SDKMessage): void {
  switch (message.type) {
    case "system":
      if (message.subtype === "init") {
        console.log(`📦 모델: ${message.model}`);
      }
      break;

    case "assistant":
      // 어시스턴트 응답 처리
      if (message.message.content) {
        for (const block of message.message.content) {
          if (block.type === "text") {
            process.stdout.write(block.text);
          } else if (block.type === "tool_use") {
            console.log(`\n🔧 도구 사용: ${block.name}`);
          }
        }
      }
      break;

    case "result":
      // 최종 결과 처리
      if (message.subtype === "success") {
        totalCost += message.total_cost_usd;
        totalDuration += message.duration_ms;
        console.log(`\n\n💰 비용: $${message.total_cost_usd.toFixed(4)} (총 $${totalCost.toFixed(4)})`);
      } else {
        console.log(`\n❌ 오류: ${message.subtype}`);
        if ("errors" in message && message.errors) {
          message.errors.forEach((err) => console.error(`  - ${err}`));
        }
      }
      break;

    case "stream_event":
      // 스트리밍 이벤트 (필요시 활성화)
      break;

    default:
      // 기타 메시지 타입
      break;
  }
}

/**
 * 도움말 출력
 */
function showHelp(): void {
  console.log(`
┌─────────────────────────────────────────────────┐
│  Eduatalk Coding Agent - 명령어 도움말          │
├─────────────────────────────────────────────────┤
│  /help, /h     이 도움말 표시                   │
│  /clear, /c    세션 초기화 (새 대화 시작)       │
│  /stats, /s    현재 세션 통계                   │
│  /exit, /q     에이전트 종료                    │
├─────────────────────────────────────────────────┤
│  그 외 입력은 에이전트에게 전달됩니다.          │
└─────────────────────────────────────────────────┘
`);
}

/**
 * 통계 출력
 */
function showStats(): void {
  console.log(`
📊 세션 통계
  • 총 비용: $${totalCost.toFixed(4)}
  • 총 소요 시간: ${(totalDuration / 1000).toFixed(1)}초
  • 세션 상태: ${isFirstQuery ? "새 세션" : "연속 대화 중"}
`);
}

/**
 * 세션 초기화
 */
function clearSession(): void {
  isFirstQuery = true;
  totalCost = 0;
  totalDuration = 0;
  console.log("🔄 세션이 초기화되었습니다. 새 대화를 시작합니다.\n");
}

/**
 * 대화형 모드 실행
 */
async function runInteractiveMode(): Promise<void> {
  console.log(`
┌─────────────────────────────────────────────────┐
│       🚀 Eduatalk Coding Agent (대화형 모드)    │
├─────────────────────────────────────────────────┤
│  코드 분석, 편집, 명령 실행을 도와드립니다.     │
│  /help 로 사용 가능한 명령어를 확인하세요.      │
│  /exit 또는 Ctrl+C 로 종료합니다.               │
└─────────────────────────────────────────────────┘
`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = (): Promise<string> => {
    return new Promise((resolve) => {
      rl.question("\n💬 > ", (answer) => {
        resolve(answer);
      });
    });
  };

  // 메인 루프
  while (true) {
    const input = await prompt();
    const trimmedInput = input.trim();

    // 빈 입력 무시
    if (!trimmedInput) {
      continue;
    }

    // 명령어 처리
    const command = trimmedInput.toLowerCase();

    if (command === "/exit" || command === "/q" || command === "/quit") {
      console.log("\n👋 에이전트를 종료합니다.");
      showStats();
      rl.close();
      break;
    }

    if (command === "/help" || command === "/h") {
      showHelp();
      continue;
    }

    if (command === "/clear" || command === "/c") {
      clearSession();
      continue;
    }

    if (command === "/stats" || command === "/s") {
      showStats();
      continue;
    }

    // 에이전트에게 요청 전달
    await runAgent(trimmedInput);
  }
}

/**
 * 단일 실행 모드
 */
async function runSingleMode(prompt: string): Promise<void> {
  console.log("🚀 Eduatalk Coding Agent\n");
  console.log(`📝 요청: ${prompt}`);

  const success = await runAgent(prompt, true);

  if (success) {
    console.log("✨ 작업 완료!");
  }
}

// CLI 인터페이스
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // 대화형 모드 플래그 확인
  const interactiveFlags = ["-i", "--interactive"];
  const isInteractive = args.some((arg) => interactiveFlags.includes(arg));
  const filteredArgs = args.filter((arg) => !interactiveFlags.includes(arg));

  if (isInteractive || filteredArgs.length === 0) {
    // 대화형 모드
    await runInteractiveMode();
  } else {
    // 단일 실행 모드
    const prompt = filteredArgs.join(" ");
    await runSingleMode(prompt);
  }
}

// Ctrl+C 핸들링
process.on("SIGINT", () => {
  console.log("\n\n👋 에이전트를 종료합니다.");
  showStats();
  process.exit(0);
});

// 에이전트 실행
main().catch(console.error);
