import { Link } from 'react-router';

import markerIconUrl from '@/shared/assets/icons/marker.svg';
import { Button } from '@/shared/ui/button';
import { Logo } from '@/shared/ui/logo';

import mainImageUrl from './assets/onboarding-main.png';

export default function OnboardingPage() {
  return (
    // 화면 높이에 고정해 세로 스크롤 없이 하단 CTA 를 항상 보여 주고, 남는 높이는 메인 이미지가 채웁니다.
    <main className="flex h-svh flex-col gap-6 overflow-hidden bg-white px-5 pt-[calc(2rem+var(--safe-area-top))] pb-[calc(2rem+var(--safe-area-bottom))]">
      <div className="flex min-h-0 flex-1 flex-col items-center">
        <Logo className="mt-10 shrink-0" />
        {/* 시안처럼 이미지가 좌우 여백 밖(각 33px)과 아래 간격까지 걸치도록 둡니다. 높이가 모자라면 비율을 유지한 채 줄어듭니다. */}
        <img
          src={mainImageUrl}
          alt=""
          className="mt-[15px] -mb-7 min-h-0 w-[calc(100%+66px)] max-w-none flex-1 object-contain"
        />
      </div>

      <div className="flex shrink-0 flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-title-xl font-bold text-slate-900">
            {/* 줄바꿈만 있으면 스크린리더가 "때,걸어서"로 붙여 읽으므로 공백을 둡니다. */}
            시간이 남을 때, <br />
            걸어서 갈 만한 곳
          </h1>
          <p className="text-text-m font-normal text-slate-600">
            회원가입은 필요 없어요.
            <br />
            위치만 허용하면 바로 시작할 수 있어요.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          {/* 위치 권한 요청과 분기는 FE-157 에서 연결합니다. */}
          <Button
            className="w-full"
            icon={<img src={markerIconUrl} alt="" width={16} height={16} />}
          >
            위치 허용하고 시작하기
          </Button>
          <Link
            to="/neighborhood"
            className="text-text-m font-normal text-slate-600"
          >
            동네 직접 고르기
          </Link>
        </div>
      </div>
    </main>
  );
}
