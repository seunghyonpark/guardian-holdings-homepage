# FanLetter Campaign Agent Prototype

상품 URL을 AI 캐릭터 성장 캠페인으로 바꾸는 광고주용 프로토타입이다.

## 실행

```bash
node server.mjs
```

브라우저에서 연다.

```text
http://localhost:4173
```

## 구현된 흐름

```text
상품 URL 입력
  -> POST /api/advertiser/campaigns/analyze
  -> 상품 카드와 캐릭터 적합도 추천
  -> POST /api/advertiser/campaigns
  -> POST /api/advertiser/campaigns/:campaignId/submit
  -> PATCH /api/admin/campaigns/:campaignId/status
  -> POST /api/campaigns/:shareSlug/events
  -> 진행률과 리포트 갱신
```

## 주요 API

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/health` | 서버 상태 |
| GET | `/api/catalog/characters` | 캐릭터 목록 |
| POST | `/api/advertiser/campaigns/analyze` | 상품 URL 분석과 캐릭터 매칭 |
| POST | `/api/advertiser/campaigns` | 캠페인 초안 생성 |
| POST | `/api/advertiser/campaigns/:campaignId/submit` | 승인 요청 |
| PATCH | `/api/admin/campaigns/:campaignId/status` | 테스트 승인/상태 변경 |
| GET | `/api/campaigns/:shareSlug` | 공유 캠페인 조회 |
| POST | `/api/campaigns/:shareSlug/events` | 클릭/공유/전환 이벤트 기록 |
| GET | `/api/advertiser/campaigns/:campaignId/report` | 캠페인 리포트 |

## 현재 제약

- 데이터는 서버 메모리에만 저장된다.
- 상품 URL 크롤링은 아직 목업 추정 로직이다.
- `테스트 승인` 버튼은 실제 운영자 승인을 대체하는 프로토타입 기능이다.
- 실제 앱 적용 시 DB, 인증, 광고주 권한, 운영자 승인 화면이 필요하다.
