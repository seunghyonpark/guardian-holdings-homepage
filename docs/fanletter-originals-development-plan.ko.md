# FanLetter Originals 개발기획서

## 1. 문서 목적

이 문서는 FanLetter Originals MVP를 개발하기 위한 실행 기획서다. 제품 기획의 핵심 루프를 실제 개발 단위로 변환하고, 화면, 데이터, API, 이벤트, 운영 도구, 출시 범위를 정의한다.

MVP의 첫 데모 목표:

> 팬이 AI 캐릭터의 1인칭 브이로그를 보고 다음 장면을 요청하면, 캐릭터의 성장값이 변하고 Growth Log에 기록된다.

## 2. MVP 제품 범위

### 포함

- 캐릭터 채널
- 9:16 브이로그 플레이어
- 팬레터 작성
- 다음 장면 요청
- 성장 로그
- 공식 에피소드 리더
- Canon Board
- 작가 스튜디오 기본 화면
- 캐릭터 바이블
- 팬 인박스
- 유료 콘텐츠 unlock 플로우
- 기본 관리자 승인/차단 기능
- 이벤트 트래킹

### 제외

- 완전 자동 AI 영상 생성 파이프라인
- 고도화된 추천 알고리즘
- 복잡한 팬 보상/수익 배분 자동화
- 다국어 자동 운영
- 외부 웹소설 IP 라이선스 관리
- 대규모 커뮤니티 기능
- 실시간 채팅

MVP에서는 AI 생성 결과물을 자동으로 공개하지 않는다. 작가 또는 운영자의 검수 후 공개하는 구조로 간다.

## 3. 핵심 사용자

### 팬

팬은 캐릭터 브이로그를 보고, 팬레터나 다음 장면 요청을 보내고, 성장 로그와 Canon Board에서 반영 여부를 확인한다.

핵심 행동:

- 브이로그 시청
- 팬레터 작성
- 다음 장면 요청
- 유료 브이로그 unlock
- 공식 에피소드 읽기
- Growth Log/Canon Board 재방문

### 작가

작가는 캐릭터 바이블을 관리하고, 브이로그 브리프를 만들고, 팬 반응을 검토해 공식 에피소드와 캐논을 확정한다.

핵심 행동:

- 캐릭터 생성/수정
- 브이로그 발행
- 팬 요청 검토
- 요청 채택/반려
- 공식 에피소드 작성
- 성장 해금 조건 관리

### 운영자

운영자는 콘텐츠 안전, 작가 승인, 결제 상태, 신고/차단을 관리한다.

핵심 행동:

- 작가 승인
- 캐릭터 승인
- 공개 전 콘텐츠 검수
- 신고 처리
- 유료 콘텐츠 상태 확인
- 긴급 비공개 처리

## 4. 핵심 서비스 루프

```text
캐릭터 생성
  -> 브이로그 발행
  -> 팬 시청
  -> 팬레터/다음 장면 요청
  -> 성장값 업데이트
  -> 작가가 요청 검토
  -> Canon Board 상태 변경
  -> 공식 에피소드/후속 브이로그 발행
  -> 팬 재방문/결제
```

첫 릴리즈에서 반드시 동작해야 하는 최소 루프:

```text
Vlog View
  -> Next Scene Request
  -> Growth Event Created
  -> Growth Log Updated
```

커머스 캠페인 확장 루프:

```text
Advertiser Product URL
  -> Product Campaign Draft
  -> Character Match
  -> Writer/Admin Approval
  -> Campaign Share Link
  -> Click/Share/Conversion Event
  -> Growth Event Created
  -> Growth Log Updated
```

이 확장은 팬 핵심 루프를 대체하지 않는다. 광고주 상품 캠페인을 캐릭터 성장 이벤트의 새로운 원천으로 추가한다.

## 5. 화면별 개발 명세

### 5.1 캐릭터 채널

경로 예시:

- `/characters/:characterId`

기능:

- 캐릭터 프로필 표시
- 최신 브이로그 표시
- 성장 스탯 표시
- 탭 전환: Vlogs, Episodes, Growth, Canon
- 팬레터/다음 장면 요청 CTA
- 유료 콘텐츠 진입 CTA

필수 데이터:

- character
- latest_vlog
- growth_stats
- recent_growth_events
- latest_episode
- canon_summary

수락 기준:

- 캐릭터 이름, 작가, 장르, 시즌, 현재 상태가 보인다.
- 최신 브이로그를 재생할 수 있다.
- 팬레터/다음 장면 요청 버튼이 보인다.
- 성장 스탯이 최소 5개 표시된다.
- Growth 탭과 Canon 탭으로 이동할 수 있다.

### 5.2 브이로그 플레이어

경로 예시:

- `/characters/:characterId/vlogs/:vlogId`

기능:

- 9:16 영상 재생
- 공개/팬전용/유료 상태 표시
- 좋아요, 저장, 공유
- 관련 에피소드 이동
- 팬레터 작성
- 다음 장면 요청
- 유료 잠금 상태 처리

수락 기준:

- 공개 영상은 로그인 없이 재생 가능하다.
- 유료 영상은 구매 전 미리보기 또는 잠금 화면이 보인다.
- 영상 완료 이벤트가 기록된다.
- 영상 하단에서 팬레터와 다음 장면 요청을 열 수 있다.

### 5.3 팬레터/다음 장면 요청

경로/컴포넌트:

- 모달 또는 `/characters/:characterId/letters/new`

기능:

- 유형 선택: 응원, 질문, 다음 장면, 비밀 메시지, 우선 검토
- 메시지 입력
- 공개 여부 선택
- 유료 우선 검토 옵션
- 제출 후 성장값 반영

수락 기준:

- 팬레터 제출 시 `fan_letters` 레코드가 생성된다.
- 다음 장면 요청은 `type = next_scene_request`로 저장된다.
- 제출 후 친밀도 또는 서사력 증가 이벤트가 생성된다.
- 제출 완료 화면에서 증가한 성장값이 표시된다.
- 유료 우선 검토를 선택하면 결제 플로우로 연결된다.

### 5.4 Growth Log

경로 예시:

- `/characters/:characterId/growth`

기능:

- 현재 성장 스탯 표시
- 최근 성장 이벤트 표시
- 다음 해금 조건 표시
- 팬 기여 내역 표시

수락 기준:

- 팬레터 제출 후 Growth Log에 이벤트가 추가된다.
- 성장 이벤트는 발생 원인을 표시한다.
- 다음 레벨까지 남은 진행률이 표시된다.

### 5.5 Canon Board

경로 예시:

- `/characters/:characterId/canon`

기능:

- 팬 요청의 상태 표시
- 제출됨, 검토 중, 소프트 캐논, 공식 캐논, 반려됨 상태 지원
- 작가 코멘트 표시
- 관련 브이로그/에피소드 연결

수락 기준:

- 작가가 팬 요청 상태를 변경할 수 있다.
- 상태 변경 내역이 팬 화면에 반영된다.
- 공식 캐논 항목은 관련 콘텐츠 링크를 가진다.

### 5.6 공식 에피소드 리더

경로 예시:

- `/characters/:characterId/episodes/:episodeId`

기능:

- 제목, 작가명, 시즌/일차 표시
- 본문 표시
- 관련 브이로그 이동
- 관련 팬 요청 표시
- 다음 장면 요청 CTA

수락 기준:

- 에피소드 본문을 읽을 수 있다.
- 관련 브이로그가 있으면 이동할 수 있다.
- 읽기 완료 이벤트가 기록된다.

### 5.7 작가 스튜디오

경로 예시:

- `/studio`
- `/studio/characters/:characterId`

기능:

- 오늘 할 일
- 캐릭터별 성과 요약
- 팬 요청 요약
- 브이로그/에피소드 발행 상태

수락 기준:

- 작가는 본인 캐릭터만 볼 수 있다.
- 팬 요청 대기 건수를 볼 수 있다.
- 캐릭터 바이블, 팬 인박스, 에피소드 에디터로 이동할 수 있다.

### 5.8 캐릭터 바이블

경로 예시:

- `/studio/characters/:characterId/bible`

기능:

- 기본 정보
- 말투/성격
- 세계관
- 관계성
- 외형 키워드
- 금지 설정
- 스포일러 정책
- 팬 요청 허용 범위

수락 기준:

- 작가는 캐릭터 바이블을 저장할 수 있다.
- 금지 설정과 스포일러 정책은 브이로그/에피소드 작성 화면에서 참조된다.
- 캐릭터 공개 전 필수 입력값 검증이 동작한다.

### 5.9 팬 인박스

경로 예시:

- `/studio/characters/:characterId/inbox`

기능:

- 팬레터 목록
- 유형/상태 필터
- 유료 우선 요청 표시
- 채택/보류/반려
- Canon Board로 보내기

수락 기준:

- 작가는 팬 요청을 상태별로 필터링할 수 있다.
- 요청 상태 변경 시 팬 화면의 Canon Board에 반영된다.
- 유료 우선 요청은 일반 요청과 구분된다.

### 5.10 상품 캠페인 생성

경로 예시:

- `/advertiser/campaigns/new`
- `/studio/campaigns/new`

기능:

- 광고주 상품 URL 입력
- 상품명, 이미지, 가격, 브랜드, 설명 초안 추출
- 캠페인 목표 선택: 클릭, 구매, 쿠폰, 라방 유입, 회원가입
- 캐릭터 적합도 추천
- 캐릭터별 캠페인 브리프 생성
- 필수 문구/금지 문구 입력
- 작가 또는 운영자 승인 요청
- 캠페인 공유링크 생성

수락 기준:

- 상품 URL을 입력하면 수정 가능한 상품 카드 초안이 생성된다.
- 추천 캐릭터와 추천 이유가 표시된다.
- 캠페인 공개 전 `광고` 및 `AI 캐릭터 콘텐츠` 표시 여부를 확인한다.
- 승인된 캠페인만 공유링크가 활성화된다.
- 공유링크 클릭 이벤트가 `campaign_events`에 기록된다.
- 목표 달성 시 `growth_events`가 생성되고 Growth Log에 표시된다.

## 6. 데이터 모델 초안

### users

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 사용자 ID |
| display_name | string | 표시 이름 |
| role | enum | fan, writer, advertiser, admin |
| created_at | datetime | 생성일 |

### characters

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 캐릭터 ID |
| writer_id | uuid | 작가 ID |
| name | string | 캐릭터명 |
| genre | string | 장르 |
| status | enum | draft, review, active, paused, archived |
| season_number | int | 시즌 |
| current_day | int | 캐릭터 일차 |
| short_description | string | 한 줄 소개 |
| profile_image_url | string | 프로필 이미지 |
| visibility | enum | private, public |
| created_at | datetime | 생성일 |
| updated_at | datetime | 수정일 |

### character_bibles

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 바이블 ID |
| character_id | uuid | 캐릭터 ID |
| personality | text | 성격 |
| speech_style | text | 말투 |
| world_setting | text | 세계관 |
| relationship_map | json | 관계성 |
| visual_keywords | json | 외형 키워드 |
| prohibited_content | text | 금지 설정 |
| spoiler_policy | text | 스포일러 정책 |
| request_policy | text | 팬 요청 허용 범위 |
| nsfw_allowed | boolean | NSFW 허용 여부 |
| created_at | datetime | 생성일 |
| updated_at | datetime | 수정일 |

### vlogs

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 브이로그 ID |
| character_id | uuid | 캐릭터 ID |
| title | string | 제목 |
| scene_summary | text | 장면 설명 |
| video_url | string | 영상 URL |
| thumbnail_url | string | 썸네일 |
| location | string | 장소 |
| emotion | string | 감정 |
| visibility | enum | public, fan_only, paid, private |
| price_amount | decimal | 가격 |
| price_currency | string | 통화 |
| canon_status | enum | non_canon, soft_canon, official_canon |
| related_episode_id | uuid | 관련 에피소드 |
| source_fan_letter_id | uuid | 원천 팬 요청 |
| published_at | datetime | 공개일 |
| created_at | datetime | 생성일 |

### fan_letters

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 팬레터 ID |
| character_id | uuid | 캐릭터 ID |
| fan_id | uuid | 팬 ID |
| type | enum | cheer, question, next_scene_request, secret, paid_priority |
| body | text | 내용 |
| is_public | boolean | 공개 여부 |
| is_paid | boolean | 유료 여부 |
| moderation_status | enum | pending, approved, blocked |
| writer_status | enum | submitted, reviewing, adopted_soft, adopted_official, rejected |
| created_at | datetime | 생성일 |

### episodes

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 에피소드 ID |
| character_id | uuid | 캐릭터 ID |
| writer_id | uuid | 작가 ID |
| title | string | 제목 |
| body | text | 본문 |
| visibility | enum | public, fan_only, paid, draft |
| price_amount | decimal | 가격 |
| related_vlog_id | uuid | 관련 브이로그 |
| source_fan_letter_id | uuid | 원천 팬 요청 |
| canon_status | enum | soft_canon, official_canon |
| published_at | datetime | 공개일 |
| created_at | datetime | 생성일 |

### growth_stats

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 성장 스탯 ID |
| character_id | uuid | 캐릭터 ID |
| stat_type | enum | intimacy, awareness, story_power, revenue_power, activity |
| level | int | 현재 레벨 |
| points | int | 현재 포인트 |
| next_level_points | int | 다음 레벨 포인트 |
| updated_at | datetime | 수정일 |

### growth_events

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 성장 이벤트 ID |
| character_id | uuid | 캐릭터 ID |
| fan_id | uuid | 관련 팬 |
| stat_type | enum | 성장 스탯 |
| points_delta | int | 증가/감소 포인트 |
| trigger_type | enum | fan_letter, request, vlog_view, episode, payment, campaign, admin |
| trigger_id | uuid | 원천 데이터 ID |
| display_message | string | 팬 화면 표시 문구 |
| created_at | datetime | 생성일 |

### advertisers

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 광고주 ID |
| user_id | uuid | 연결 사용자 ID |
| company_name | string | 회사명 |
| brand_name | string | 브랜드명 |
| contact_email | string | 담당자 이메일 |
| status | enum | draft, active, suspended |
| created_at | datetime | 생성일 |
| updated_at | datetime | 수정일 |

### product_campaigns

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 캠페인 ID |
| advertiser_id | uuid | 광고주 ID |
| character_id | uuid | 매칭 캐릭터 ID |
| product_url | string | 광고주 상품 URL |
| product_name | string | 상품명 |
| product_image_url | string | 대표 이미지 |
| brand_name | string | 브랜드명 |
| price_amount | decimal | 상품 가격 |
| category | string | 상품 카테고리 |
| campaign_goal | enum | click, purchase, coupon, live_view, signup |
| campaign_type | enum | product_quest, review_vlog, coupon_drop, live_commerce_boost, fan_mission |
| required_disclosure | string | 광고/AI 표시 문구 |
| required_copy | text | 필수 문구 |
| prohibited_copy | text | 금지 문구 |
| status | enum | draft, pending_writer, pending_admin, approved, active, paused, completed, rejected |
| share_slug | string | 공유링크 식별자 |
| created_at | datetime | 생성일 |
| approved_at | datetime | 승인일 |
| published_at | datetime | 공개일 |

### campaign_character_matches

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 매칭 ID |
| campaign_id | uuid | 캠페인 ID |
| character_id | uuid | 추천 캐릭터 ID |
| fit_score | int | 적합도 점수 |
| fit_reason | text | 추천 이유 |
| risk_notes | text | 주의사항 |
| created_at | datetime | 생성일 |

### campaign_events

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 이벤트 ID |
| campaign_id | uuid | 캠페인 ID |
| character_id | uuid | 캐릭터 ID |
| user_id | uuid | 사용자 ID |
| event_type | enum | impression, click, share, coupon_download, purchase, live_view, signup |
| event_value | decimal | 전환 금액 또는 수치 |
| source | string | 유입 출처 |
| created_at | datetime | 생성일 |

### canon_items

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 캐논 항목 ID |
| character_id | uuid | 캐릭터 ID |
| source_fan_letter_id | uuid | 원천 팬 요청 |
| status | enum | submitted, reviewing, soft_canon, official_canon, rejected |
| writer_note | text | 작가 코멘트 |
| related_vlog_id | uuid | 관련 브이로그 |
| related_episode_id | uuid | 관련 에피소드 |
| adopted_at | datetime | 채택일 |
| created_at | datetime | 생성일 |

### purchases

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 구매 ID |
| user_id | uuid | 구매자 |
| content_type | enum | vlog, episode, fan_letter_priority, season_pass |
| content_id | uuid | 콘텐츠 ID |
| amount | decimal | 금액 |
| currency | string | 통화 |
| payment_status | enum | pending, paid, failed, refunded |
| provider | string | 결제 제공자 |
| provider_reference | string | 외부 결제 ID |
| created_at | datetime | 생성일 |

## 7. API 초안

### 팬 API

```http
GET /api/characters
GET /api/characters/:characterId
GET /api/characters/:characterId/vlogs
GET /api/characters/:characterId/vlogs/:vlogId
POST /api/characters/:characterId/fan-letters
GET /api/characters/:characterId/growth
GET /api/characters/:characterId/canon
GET /api/characters/:characterId/episodes
GET /api/characters/:characterId/episodes/:episodeId
GET /api/campaigns/:shareSlug
POST /api/campaigns/:shareSlug/events
POST /api/purchases
GET /api/purchases/:purchaseId
```

### 광고주 API

```http
GET /api/advertiser/campaigns
POST /api/advertiser/campaigns
GET /api/advertiser/campaigns/:campaignId
PATCH /api/advertiser/campaigns/:campaignId
POST /api/advertiser/campaigns/:campaignId/submit
GET /api/advertiser/campaigns/:campaignId/report
```

### 작가 API

```http
GET /api/studio/characters
POST /api/studio/characters
GET /api/studio/characters/:characterId
PATCH /api/studio/characters/:characterId
GET /api/studio/characters/:characterId/bible
PUT /api/studio/characters/:characterId/bible
GET /api/studio/characters/:characterId/inbox
PATCH /api/studio/fan-letters/:fanLetterId/status
POST /api/studio/characters/:characterId/vlogs
PATCH /api/studio/vlogs/:vlogId
POST /api/studio/characters/:characterId/episodes
PATCH /api/studio/episodes/:episodeId
POST /api/studio/canon-items
PATCH /api/studio/canon-items/:canonItemId
GET /api/studio/campaigns/review
PATCH /api/studio/campaigns/:campaignId/status
```

### 관리자 API

```http
GET /api/admin/characters/review
PATCH /api/admin/characters/:characterId/status
GET /api/admin/moderation/fan-letters
PATCH /api/admin/moderation/fan-letters/:fanLetterId
GET /api/admin/reports
PATCH /api/admin/content/:contentType/:contentId/visibility
GET /api/admin/campaigns/review
PATCH /api/admin/campaigns/:campaignId/status
```

## 8. 성장 포인트 규칙

MVP 기본값:

| 행동 | 스탯 | 포인트 |
| --- | --- | --- |
| 팬레터 제출 | intimacy | +3 |
| 다음 장면 요청 | story_power | +5 |
| 댓글 | intimacy | +1 |
| 저장 | awareness | +2 |
| 공유 | awareness | +5 |
| 브이로그 70% 이상 시청 | awareness | +1 |
| 공식 에피소드 발행 | story_power | +20 |
| 팬 요청 소프트 캐논 채택 | story_power | +15 |
| 팬 요청 공식 캐논 채택 | story_power | +30 |
| 유료 unlock | revenue_power | +10 |
| 7일 연속 발행 | activity | +50 |
| 캠페인 공유링크 클릭 | awareness | +1 |
| 캠페인 공유 | awareness | +5 |
| 캠페인 쿠폰 다운로드 | revenue_power | +5 |
| 캠페인 구매 전환 | revenue_power | +15 |
| 상품 경험 브이로그 공개 | story_power | +20 |

개발 요구사항:

- 포인트 규칙은 코드 상수로 고정하지 않고 설정 테이블 또는 서버 설정 객체로 분리한다.
- 같은 사용자/같은 콘텐츠 반복 행동의 중복 포인트 지급을 제한한다.
- 성장 이벤트는 반드시 원천 행동 ID를 가진다.

## 9. 이벤트 트래킹

필수 이벤트:

| 이벤트 | 발생 시점 |
| --- | --- |
| character_channel_viewed | 캐릭터 채널 진입 |
| vlog_view_started | 영상 재생 시작 |
| vlog_view_completed | 기준 시청률 달성 |
| fan_letter_submitted | 팬레터 제출 |
| next_scene_request_submitted | 다음 장면 요청 제출 |
| growth_log_viewed | 성장 로그 조회 |
| canon_board_viewed | Canon Board 조회 |
| canon_item_status_changed | 작가가 캐논 상태 변경 |
| episode_started | 에피소드 읽기 시작 |
| episode_completed | 에피소드 완료 |
| paid_unlock_started | 결제 시작 |
| paid_unlock_completed | 결제 성공 |
| product_campaign_created | 상품 캠페인 생성 |
| product_campaign_submitted | 상품 캠페인 승인 요청 |
| product_campaign_approved | 상품 캠페인 승인 |
| campaign_share_link_opened | 캠페인 공유링크 진입 |
| campaign_conversion_recorded | 캠페인 전환 기록 |

핵심 퍼널:

```text
character_channel_viewed
  -> vlog_view_completed
  -> fan_letter_submitted / next_scene_request_submitted
  -> growth_log_viewed / canon_board_viewed
  -> return_visit
  -> paid_unlock_completed
```

## 10. 권한 정책

### 팬

- 공개 캐릭터 조회 가능
- 공개 브이로그 조회 가능
- 팬레터 작성 가능
- 본인 팬레터 조회 가능
- 유료 구매 후 해당 콘텐츠 접근 가능
- 활성화된 캠페인 공유링크 조회 가능

### 광고주

- 본인 캠페인 생성/수정 가능
- 승인 전 캠페인 제출 가능
- 본인 캠페인 리포트 조회 가능
- 다른 광고주의 캠페인 수정 불가
- 승인된 캠페인의 공개 문구는 임의 변경 불가

### 작가

- 본인 캐릭터 관리 가능
- 본인 캐릭터의 팬레터 조회 가능
- 본인 캐릭터의 캐논 상태 변경 가능
- 본인 캐릭터의 브이로그/에피소드 작성 가능
- 다른 작가 캐릭터 수정 불가
- 본인 캐릭터에 들어온 상품 캠페인 승인/거절 가능

### 관리자

- 전체 캐릭터 조회/상태 변경 가능
- 신고 콘텐츠 비공개 가능
- 작가 승인 가능
- 상품 캠페인 승인/차단 가능
- 결제 상태 조회 가능

## 11. 결제 정책

MVP 결제 상품:

- 유료 브이로그 unlock
- 유료 에피소드 unlock
- 우선 검토 팬레터
- 시즌 패스

결제 상태:

- pending
- paid
- failed
- refunded

주의사항:

- 우선 검토 팬레터는 채택을 보장하지 않는다.
- 결제 성공 전 유료 콘텐츠 원본 URL을 노출하지 않는다.
- 환불 시 접근 권한 처리 정책을 명확히 둔다.
- x402/USDT 결제를 우선 고려하되, 추후 카드 결제 확장 가능성을 열어둔다.

## 12. AI 생성 파이프라인

MVP에서는 완전 자동화가 아니라 검수형 파이프라인으로 구현한다.

```text
Character Bible
  -> Vlog Brief
  -> AI Generation Request
  -> Draft Asset
  -> Writer/Admin Review
  -> Publish
```

필수 저장 정보:

- 사용한 캐릭터 바이블 버전
- 프롬프트 또는 브리프
- 생성 결과 URL
- 검수자
- 검수 상태
- 공개 여부

MVP 상태:

- draft
- generating
- review
- approved
- rejected
- published

## 13. 운영/관리 기능

MVP 관리자 기능:

- 작가 승인
- 캐릭터 공개 승인
- 콘텐츠 비공개
- 팬레터 차단
- 신고 목록 확인
- 유료 콘텐츠 접근 상태 확인

관리자에서 반드시 필요한 빠른 액션:

- 캐릭터 일시 중지
- 특정 브이로그 비공개
- 특정 에피소드 비공개
- 팬레터 moderation_status 변경
- 작가 계정 정지

## 14. 개발 스프린트 계획

### Sprint 0: 기반 정리

목표:

- 프로젝트 구조, 인증, DB, 기본 라우팅 준비

작업:

- 사용자 role 모델링
- 캐릭터/브이로그/팬레터/성장 이벤트 테이블 생성
- 기본 seed 데이터 생성
- 캐릭터 채널 라우트 추가
- 이벤트 트래킹 헬퍼 추가

완료 기준:

- seed 캐릭터 1개를 화면에서 조회할 수 있다.
- API로 팬레터를 생성할 수 있다.

### Sprint 1: 팬 핵심 루프

목표:

- 브이로그 시청 후 다음 장면 요청, 성장 로그 반영

작업:

- 캐릭터 채널
- 브이로그 플레이어
- 팬레터/다음 장면 요청 모달
- 성장 포인트 계산
- Growth Log
- 이벤트 트래킹

완료 기준:

- 팬이 다음 장면 요청을 제출하면 `fan_letters`와 `growth_events`가 생성된다.
- 캐릭터의 성장 스탯이 변한다.
- Growth Log에 해당 이벤트가 보인다.

### Sprint 2: 작가 운영 루프

목표:

- 작가가 팬 요청을 검토하고 캐논 상태를 변경

작업:

- 작가 스튜디오
- 팬 인박스
- 요청 상태 변경
- Canon Board
- 캐릭터 바이블 기본 CRUD

완료 기준:

- 작가가 팬 요청을 검토 중/소프트 캐논/공식 캐논/반려로 변경할 수 있다.
- 팬 화면 Canon Board에 변경 사항이 표시된다.

### Sprint 2.5: 상품 캠페인 생성 루프

목표:

- 광고주 상품 URL로 캐릭터 성장 캠페인을 만들고 공유링크 성과를 추적

작업:

- 광고주 role 추가
- 상품 캠페인 생성 화면
- 상품 카드 자동 추출/수동 편집
- 캐릭터 적합도 추천
- 작가/운영자 승인 상태
- 캠페인 공유링크
- 캠페인 클릭 이벤트 기록
- Growth Log 캠페인 이벤트 표시

완료 기준:

- 광고주가 상품 URL을 입력해 캠페인 초안을 만들 수 있다.
- 승인된 캠페인만 공유링크가 열린다.
- 공유링크 클릭이 `campaign_events`에 기록된다.
- 캠페인 목표 달성 시 `growth_events`가 생성된다.

### Sprint 3: 공식 에피소드와 유료 unlock

목표:

- 작가가 공식 에피소드를 발행하고, 유료 콘텐츠 접근을 제어

작업:

- 에피소드 에디터
- 에피소드 리더
- 관련 브이로그/팬 요청 연결
- 유료 콘텐츠 잠금 화면
- 결제 상태 기반 접근 제어

완료 기준:

- 공식 에피소드를 발행할 수 있다.
- 관련 브이로그와 팬 요청이 연결된다.
- 유료 콘텐츠는 결제 성공 후 접근 가능하다.

### Sprint 4: 파일럿 운영 준비

목표:

- 10개 캐릭터 파일럿을 운영할 수 있게 안정화

작업:

- 관리자 승인/비공개 기능
- 신고/차단
- 기본 분석 대시보드
- seed 캐릭터/콘텐츠 입력
- QA 및 성능 점검

완료 기준:

- 작가 5명, 캐릭터 10개 파일럿 운영이 가능하다.
- 핵심 퍼널 이벤트를 조회할 수 있다.
- 운영자가 문제 콘텐츠를 비공개 처리할 수 있다.

## 15. QA 체크리스트

팬 플로우:

- 공개 캐릭터 채널 진입
- 공개 브이로그 재생
- 팬레터 제출
- 다음 장면 요청 제출
- 제출 후 성장 포인트 반영
- Growth Log 확인
- Canon Board 확인
- 공식 에피소드 읽기
- 유료 콘텐츠 구매 후 접근

작가 플로우:

- 캐릭터 생성
- 캐릭터 바이블 입력
- 팬 요청 목록 조회
- 팬 요청 상태 변경
- 캐논 항목 생성
- 에피소드 작성/발행
- 브이로그 등록/발행

운영자 플로우:

- 캐릭터 승인
- 콘텐츠 비공개
- 팬레터 차단
- 신고 처리
- 유료 접근 상태 확인

보안/권한:

- 다른 작가의 캐릭터 수정 불가
- 결제 전 유료 콘텐츠 접근 불가
- 차단된 팬레터는 팬 화면에 공개되지 않음
- 비공개 캐릭터는 일반 팬에게 노출되지 않음

## 16. 리스크와 대응

| 리스크 | 대응 |
| --- | --- |
| 작가 운영 부담 증가 | 팬 반응 요약, 브리프 템플릿, 주간 운영 리듬 제공 |
| 팬 요청이 캐릭터 붕괴 유도 | Character Bible의 금지 설정과 작가 승인 필수화 |
| 유료 요청 채택 기대 문제 | "우선 검토이며 채택 보장 아님" 문구 명확화 |
| AI 생성 콘텐츠 안전 문제 | 공개 전 검수 상태 필수화 |
| 성장값 어뷰징 | 중복 행동 제한, 운영자 조정 기능 |
| 웹소설 플랫폼으로 오해 | 모든 에피소드 화면에서 브이로그/팬 행동 CTA 유지 |

## 17. 출시 전 필수 결정

- 결제는 x402/USDT만 사용할지, 카드 결제도 포함할지
- FanLetter Originals에서 NSFW 캐릭터를 허용할지
- 유료 팬레터 환불 기준
- 작가 원고와 캐릭터 바이블의 AI 학습 사용 여부
- 계약 종료 후 유료 구매 콘텐츠 접근 유지 정책
- 팬 요청 채택 시 팬 표시명 공개 여부
- 관리자 승인 없이 작가가 직접 공개 가능한 콘텐츠 범위

## 18. 첫 데모 시나리오

데모 캐릭터:

- 이름: 윤서
- 장르: 아이돌 연습생
- 상태: 데뷔 평가를 앞두고 팬레터를 읽으며 버티는 캐릭터

데모 순서:

1. 팬이 윤서 캐릭터 채널에 들어간다.
2. 최신 브이로그 "팬레터를 읽은 밤"을 본다.
3. 팬이 "비 오는 날 퇴근길을 보여줘"라는 다음 장면 요청을 보낸다.
4. 제출 완료 화면에서 친밀도 +3, 서사력 +5가 표시된다.
5. Growth Log에 "다음 장면 요청이 도착했습니다" 이벤트가 보인다.
6. 작가 스튜디오에서 해당 요청이 Fan Inbox에 보인다.
7. 작가가 요청을 "검토 중"으로 바꾼다.
8. 팬 화면 Canon Board에 요청 상태가 "검토 중"으로 표시된다.

이 데모가 안정적으로 동작하면 MVP의 핵심 가설을 검증할 수 있다.
