export type SheetStage = 'peek' | 'half' | 'full';

// getSnapStage 가 앞뒤 단계를 순서로 찾으므로 낮은 단계부터 둔다
export const SHEET_STAGES = [
  'peek',
  'half',
  'full',
] as const satisfies readonly SheetStage[];

export const LOWEST_STAGE = SHEET_STAGES[0];
export const HIGHEST_STAGE = SHEET_STAGES[SHEET_STAGES.length - 1];
