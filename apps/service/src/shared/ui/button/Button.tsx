import type { ComponentProps, ReactNode } from 'react';

type ButtonProps = ComponentProps<'button'> & {
  /** 라벨 왼쪽에 놓는 16px 아이콘 */
  icon?: ReactNode;
};

// 피그마 Button 컴포넌트의 Size=Medium, Hierarchy=Primary 변형(Default / Hover / Disabled).
// 다른 크기·계층은 공통 컴포넌트 작업(FE-99)에서 추가합니다.
export default function Button({
  icon,
  type = 'button',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-primary-500 px-6 py-2 text-body font-semibold text-white hover:bg-primary-600 disabled:bg-slate-100 disabled:text-slate-500 ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
