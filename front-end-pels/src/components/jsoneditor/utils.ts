import {
  isJSONContent,
  isTextContent,
  type Content,
  type JSONEditorSelection,
} from 'vanilla-jsoneditor';

export function formatParseFailureMessage(err: unknown): string {
  if (err instanceof SyntaxError) return err.message;
  return String(err);
}

/** “Empty document”에 해당하는 상태를 앱 기준으로 판별 */
export function isDocumentVisuallyEmpty(content: Content): boolean {
  if (isTextContent(content)) return content.text.trim().length === 0;
  if (isJSONContent(content))
    return content.json === undefined || content.json === null;
  return true;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export function asTextForClipboard(content: Content): string {
  if (isJSONContent(content)) {
    return JSON.stringify(content.json ?? null, null, 2);
  }
  return content.text ?? '';
}

export function getSelectionOrUndefined(
  selection: JSONEditorSelection | undefined
): JSONEditorSelection | undefined {
  return selection;
}
