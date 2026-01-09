import { PieChart, List, CheckCircle2, Circle, Clock } from 'lucide-react'
import type { Database } from '../types/database'
import './Dashboard.css'

type Todo = Database['public']['Tables']['todos']['Row']

interface DashboardProps {
  todos: Todo[]
}

export default function Dashboard({ todos }: DashboardProps) {
  const total = todos.length
  const todo = todos.filter(t => (t.status || 'todo') === 'todo').length
  const inProgress = todos.filter(t => t.status === 'in_progress').length
  const done = todos.filter(t => (t.status || 'todo') === 'done' || t.completed).length
  const progress = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div className="dashboard-grid">
      <div className="stat-card">
        <div className="stat-icon-wrapper blue">
          <List className="stat-icon" />
        </div>
        <div className="stat-content">
          <p className="stat-label">전체 작업</p>
          <p className="stat-value">{total}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper green">
          <CheckCircle2 className="stat-icon" />
        </div>
        <div className="stat-content">
          <p className="stat-label">완료</p>
          <p className="stat-value">{done}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper orange">
          <Circle className="stat-icon" />
        </div>
        <div className="stat-content">
          <p className="stat-label">진행 중</p>
          <p className="stat-value">{inProgress}</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon-wrapper blue">
          <Clock className="stat-icon" />
        </div>
        <div className="stat-content">
          <p className="stat-label">할 일</p>
          <p className="stat-value">{todo}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper purple">
          <PieChart className="stat-icon" />
        </div>
        <div className="stat-content">
          <p className="stat-label">진행률</p>
          <p className="stat-value">{progress}%</p>
        </div>
      </div>
    </div>
  )
}
