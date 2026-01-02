import { PieChart, List, CheckCircle2, Circle } from 'lucide-react'
import type { Database } from '../types/database'
import './Dashboard.css'

type Todo = Database['public']['Tables']['todos']['Row']

interface DashboardProps {
  todos: Todo[]
}

export default function Dashboard({ todos }: DashboardProps) {
  const total = todos.length
  const completed = todos.filter(t => t.completed).length
  const pending = total - completed
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div className="dashboard-grid">
      <div className="stat-card">
        <div className="stat-icon-wrapper blue">
          <List className="stat-icon" />
        </div>
        <div className="stat-content">
          <p className="stat-label">Total Tasks</p>
          <p className="stat-value">{total}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper green">
          <CheckCircle2 className="stat-icon" />
        </div>
        <div className="stat-content">
          <p className="stat-label">Completed</p>
          <p className="stat-value">{completed}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper orange">
          <Circle className="stat-icon" />
        </div>
        <div className="stat-content">
          <p className="stat-label">Pending</p>
          <p className="stat-value">{pending}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper purple">
          <PieChart className="stat-icon" />
        </div>
        <div className="stat-content">
          <p className="stat-label">Progress</p>
          <p className="stat-value">{progress}%</p>
        </div>
      </div>
    </div>
  )
}
