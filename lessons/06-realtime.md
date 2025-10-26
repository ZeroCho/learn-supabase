# 섹션 6: Realtime - 실시간 통신

## 목표
실시간 데이터 동기화를 구현합니다.

## 학습 내용
- Realtime 구독/구독 해제
- 채널 및 필터 활용
- Broadcast vs Presence
- 실시간 이벤트 처리

## 실습 예제

```typescript
// 구독
const channel = supabase
  .channel('todos')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'todos'
  }, (payload) => {
    console.log('New todo:', payload.new)
  })
  .subscribe()

// 구독 해제
supabase.removeChannel(channel)
```

## 공식 문서
- [Realtime 가이드](https://supabase.com/docs/guides/realtime)
- [Realtime API](https://supabase.com/docs/reference/javascript/realtime-api)
