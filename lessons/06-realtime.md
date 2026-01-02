# 섹션 6: Realtime - 실시간 통신

## 목표
실시간 데이터 동기화를 구현합니다.

## 학습 내용
### 1. Realtime 구독/구독 해제
Supabase는 WebSocket을 통해 데이터베이스의 변경 사항을 실시간으로 클라이언트에 푸시합니다.
- **구독(Subscribe)**: `supabase.channel().subscribe()`를 통해 연결을 시작합니다.
- **해제(Unsubscribe)**: `supabase.removeChannel()`로 연결을 끊어 리소스를 절약해야 합니다 (예: 페이지 이동 시).

### 2. 채널 및 필터 활용
모든 데이터를 다 받는 것은 비효율적입니다. 필요한 데이터만 골라 받을 수 있습니다.
- **Event 필터**: `INSERT`, `UPDATE`, `DELETE` 중 원하는 이벤트만 선택합니다.
- **Row 필터**: `filter: 'user_id=eq.123'` 처럼 특정 조건에 맞는 행의 변경사항만 수신할 수 있습니다.

### 3. Broadcast (브로드캐스트)
데이터베이스를 거치지 않고 클라이언트끼리 직접 메시지를 주고받는 기능입니다.
- **용도**: 마우스 커서 위치 공유, '타이핑 중...' 표시 등 DB에 저장할 필요가 없는 휘발성 데이터 전송에 최적화되어 있습니다.
- **속도**: DB 쓰기 과정이 없으므로 매우 빠릅니다 (Low Latency).

### 4. Presence (프레즌스)
현재 채널에 접속해 있는 사용자들의 상태(State)를 공유하고 동기화하는 기능입니다.
- **용도**: '현재 접속 중인 사용자 목록', '온라인/오프라인 상태 표시' 구현에 사용됩니다.
- **동기화**: 사용자가 들어오거나(join) 나갈 때(leave) 자동으로 상태를 업데이트해 줍니다.

## Realtime 설정 방법

Realtime 기능은 기본적으로 활성화되어 있을 수 있지만, 특정 테이블에 대해 명시적으로 켜야 할 수도 있습니다.

1.  **Supabase Dashboard** 접속.
2.  **Table Editor**로 이동.
3.  Realtime을 적용할 테이블(예: `todos`)을 선택.
4.  우측 상단의 **Edit Table** 클릭.
5.  **Enable Realtime** 체크박스 활성화 후 저장.
6.  이제 클라이언트에서 해당 테이블의 변경 사항을 구독할 수 있습니다.

## 실습 예제

```typescript
// src/06-realtime/index.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY')

// 1. Postgres Changes (DB 변경사항 구독)
const dbChannel = supabase
  .channel('db-changes')
  .on('postgres_changes', {
    event: '*', // INSERT, UPDATE, DELETE, or *
    schema: 'public',
    table: 'todos'
  }, (payload) => {
    console.log('DB 변경됨:', payload)
  })
  .subscribe()

// 2. Broadcast (클라이언트 간 메시지 전송)
// 예: 마우스 커서 위치, 타이핑 중 표시 등 DB에 저장할 필요 없는 휘발성 데이터
const roomChannel = supabase.channel('room_1')

roomChannel
  .on('broadcast', { event: 'cursor-pos' }, (payload) => {
    console.log('다른 유저 커서:', payload.payload)
  })
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      // 메시지 전송 예시
      roomChannel.send({
        type: 'broadcast',
        event: 'cursor-pos',
        payload: { x: 100, y: 200 },
      })
    }
  })

// 3. Presence (사용자 접속 상태 공유)
// 예: "현재 접속 중인 사용자 목록"
const presenceChannel = supabase.channel('online-users')

presenceChannel
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState()
    console.log('현재 접속자 목록:', state)
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('입장:', newPresences)
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('퇴장:', leftPresences)
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      // 내 상태 전송
      await presenceChannel.track({
        user_id: 'user_123',
        online_at: new Date().toISOString(),
      })
    }
  })
```

## 공식 문서
- [Realtime 가이드](https://supabase.com/docs/guides/realtime)
- [Realtime API](https://supabase.com/docs/reference/javascript/realtime-api)
