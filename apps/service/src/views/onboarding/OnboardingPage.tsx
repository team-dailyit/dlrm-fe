import { useOnboardingEntry } from '@/features/onboarding-entry';

// TODO(FE-178): 온보딩 마크업(FE-171)이 머지되면 "위치 허용하고 시작하기" 버튼에 startWithLocation 을 연결한다
export default function OnboardingPage() {
  const { isDeciding } = useOnboardingEntry();

  // 저장된 동네·위치 권한으로 진입 화면을 정하는 동안에는 온보딩이 잠깐 보였다 사라지지 않도록 그리지 않는다
  if (isDeciding) {
    return null;
  }

  return <h1>온보딩</h1>;
}
