import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // shared 는 빌드 없이 소스를 내보내므로 Next 가 트랜스파일해야 합니다.
  transpilePackages: ['shared'],
};

export default nextConfig;
