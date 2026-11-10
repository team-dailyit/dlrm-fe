import { neighborhoodsHandler } from '@/entities/neighborhood/api/neighborhoodHandlers';

// 개발 서버에서 MSW 가 응답할 API 목록이다. 테스트와 같은 응답 예시를 쓴다
export const handlers = [neighborhoodsHandler];
