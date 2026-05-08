import type { Content, JSONEditorSelection } from 'vanilla-jsoneditor';

export type RefreshBanner =
  | { kind: 'ok'; title: string; detail: string }
  | { kind: 'warn'; title: string; detail: string }
  | { kind: 'error'; title: string; detail: string };

export type LiveJsonIssue =
  | { kind: 'parse'; title: string; detail: string }
  | { kind: 'validation'; title: string; detail: string };

export type ParseIssueMeta = {
  position?: number;
  line?: number;
  column?: number;
  isRepairable?: boolean;
} | null;

export type ContextMenuState =
  | {
      open: true;
      x: number;
      y: number;
      selection: JSONEditorSelection | undefined;
    }
  | { open: false };

export type SeedContentPreset =
  | { kind: 'empty-object' }
  | { kind: 'empty-array' }
  | { kind: 'sample'; value: unknown };

export type JsonEditorPanelValue =
  | { kind: 'content'; content: Content }
  | { kind: 'preset'; preset: SeedContentPreset };
