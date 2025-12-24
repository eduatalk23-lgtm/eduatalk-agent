/**
 * Eduatalk Coding Agent
 *
 * Claude Agent SDK를 사용한 코딩 에이전트입니다.
 * 코드베이스 분석, 파일 편집, 명령어 실행 등의 기능을 제공합니다.
 */

import { query, type Options, type SDKMessage } from "@anthropic-ai/claude-agent-sdk";

// 에이전트 옵션 설정
const agentOptions: Options = {
  // 모델 설정
  model: "claude-sonnet-4-20250514",

  // 권한 모드: 기본값 사용
  permissionMode: "default",

  // 사용할 도구 프리셋
  tools: {
    type: "preset",
    preset: "claude_code",
  },

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

/**
 * 에이전트 실행 함수
 */
async function runAgent(prompt: string): Promise<void> {
  console.log("🚀 Eduatalk Coding Agent 시작...\n");
  console.log(`📝 요청: ${prompt}\n`);
  console.log("─".repeat(50));

  try {
    // query 함수로 에이전트 실행 (스트리밍 모드)
    const stream = query({
      prompt,
      options: agentOptions,
    });

    // 스트림 이벤트 처리
    for await (const message of stream) {
      handleMessage(message);
    }

    console.log("\n" + "─".repeat(50));
    console.log("✨ 에이전트 작업 완료!");
  } catch (error) {
    console.error("에이전트 실행 중 오류 발생:", error);
    process.exit(1);
  }
}

/**
 * 메시지 처리 함수
 */
function handleMessage(message: SDKMessage): void {
  switch (message.type) {
    case "system":
      if (message.subtype === "init") {
        console.log(`\n📦 초기화 완료 - 모델: ${message.model}`);
        console.log(`🔧 사용 가능 도구: ${message.tools.join(", ")}`);
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
        console.log(`\n\n📊 결과: ${message.result}`);
        console.log(`💰 비용: $${message.total_cost_usd.toFixed(4)}`);
        console.log(`⏱️ 소요 시간: ${message.duration_ms}ms`);
      } else {
        console.log(`\n❌ 오류 발생: ${message.subtype}`);
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

// CLI 인터페이스
async function main(): Promise<void> {
  // 명령줄 인자에서 프롬프트 가져오기
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // 기본 데모 실행
    console.log('💡 사용법: pnpm start "<요청 내용>"\n');
    console.log("데모 모드로 실행합니다...\n");

    await runAgent(
      "현재 디렉토리의 구조를 확인하고, README.md 파일이 있다면 내용을 요약해주세요."
    );
  } else {
    // 사용자 요청 실행
    const prompt = args.join(" ");
    await runAgent(prompt);
  }
}

// 에이전트 실행
main().catch(console.error);
