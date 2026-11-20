export type CopyResult = 'copied' | 'failed';

// 클립보드는 HTTPS 가 아니거나 권한이 막히면 쓸 수 없고, Clipboard API 가 없는 브라우저도 있다(접근하면 TypeError).
// 어느 경우든 화면이 안내할 수 있도록 오류 대신 결과로 알린다
export async function copyText(text: string): Promise<CopyResult> {
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
