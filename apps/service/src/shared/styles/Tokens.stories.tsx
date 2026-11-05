import type { Meta, StoryObj } from '@storybook/react-vite';

// 피그마 '디자인시스템' 토큰(packages/shared/src/styles/tokens.css)이 Tailwind 유틸로 잘 연결됐는지 보는 확인용 스토리입니다.
// 클래스 이름은 Tailwind 가 정적으로 찾을 수 있도록 문자열 그대로 적습니다.

const COLORS = [
  ['primary-100', 'bg-primary-100'],
  ['primary-200', 'bg-primary-200'],
  ['primary-300', 'bg-primary-300'],
  ['primary-400', 'bg-primary-400'],
  ['primary-500', 'bg-primary-500'],
  ['primary-600', 'bg-primary-600'],
  ['primary-700', 'bg-primary-700'],
  ['blue-100', 'bg-blue-100'],
  ['blue-500', 'bg-blue-500'],
  ['blue-600', 'bg-blue-600'],
  ['state-error', 'bg-state-error'],
  ['state-success', 'bg-state-success'],
  ['white', 'bg-white'],
  ['slate-50', 'bg-slate-50'],
  ['slate-100', 'bg-slate-100'],
  ['slate-200', 'bg-slate-200'],
  ['slate-300', 'bg-slate-300'],
  ['slate-400', 'bg-slate-400'],
  ['slate-500', 'bg-slate-500'],
  ['slate-600', 'bg-slate-600'],
  ['slate-700', 'bg-slate-700'],
  ['slate-800', 'bg-slate-800'],
  ['slate-900', 'bg-slate-900'],
] as const;

const RADII = [
  ['xs', 'rounded-xs'],
  ['sm', 'rounded-sm'],
  ['md', 'rounded-md'],
  ['lg', 'rounded-lg'],
  ['xl', 'rounded-xl'],
  ['2xl', 'rounded-2xl'],
  ['3xl', 'rounded-3xl'],
  ['pill', 'rounded-pill'],
] as const;

const TYPOGRAPHY = [
  ['Display/xl', 'text-display-xl font-bold'],
  ['Display/lg', 'text-display-lg font-bold'],
  ['Display/md', 'text-display-md font-bold'],
  ['Title/xl', 'text-title-xl font-bold'],
  ['Title/l', 'text-title-l font-bold'],
  ['Title/m', 'text-title-m font-bold'],
  ['Title/s', 'text-title-s font-bold'],
  ['Body', 'text-body font-semibold'],
  ['Text/l', 'text-text-l font-normal'],
  ['Text/m', 'text-text-m font-normal'],
  ['Text/s', 'text-text-s font-normal'],
  ['Caption/l', 'text-caption-l font-medium'],
  ['Caption/m', 'text-caption-m font-medium'],
  ['Caption/s', 'text-caption-s font-medium'],
] as const;

function ColorPalette() {
  return (
    <ul className="grid grid-cols-3 gap-4 p-5">
      {COLORS.map(([name, className]) => (
        <li key={name} className="flex flex-col gap-1">
          <span
            className={`h-12 rounded-md border border-slate-200 ${className}`}
          />
          <span className="text-caption-l text-slate-600">{name}</span>
        </li>
      ))}
    </ul>
  );
}

function RadiusPreview() {
  return (
    <ul className="grid grid-cols-4 gap-4 p-5">
      {RADII.map(([name, className]) => (
        <li key={name} className="flex flex-col items-center gap-1">
          <span className={`size-14 bg-primary-200 ${className}`} />
          <span className="text-caption-l text-slate-600">{name}</span>
        </li>
      ))}
    </ul>
  );
}

function TypeScale() {
  return (
    <ul className="flex flex-col gap-4 p-5 text-slate-900">
      {TYPOGRAPHY.map(([name, className]) => (
        <li key={name} className="flex flex-col">
          <span className="text-caption-l text-slate-500">{name}</span>
          <span className={className}>걸어서 갈 만한 곳</span>
        </li>
      ))}
    </ul>
  );
}

const meta = {
  title: 'Foundations/Tokens',
} satisfies Meta;

export default meta;

export const Colors: StoryObj = { render: () => <ColorPalette /> };
export const Radii: StoryObj = { render: () => <RadiusPreview /> };
export const Typography: StoryObj = { render: () => <TypeScale /> };
