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
