import logoUrl from './logo.svg';

type LogoProps = {
  className?: string;
};

// 피그마 Logo 컴포넌트의 Type=Default, Size=Medium 변형. 워드마크 글꼴(NanumBarunpen)은 SVG 윤곽선으로 들어 있습니다.
export default function Logo({ className }: LogoProps) {
  return (
    <img
      src={logoUrl}
      alt="들름"
      width={117}
      height={61}
      className={className}
    />
  );
}
