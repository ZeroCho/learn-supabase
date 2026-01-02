import { useState } from 'react'
import type { Database } from '../types/database'
import { Trash2, CheckCircle, Circle, Plus, Loader2 } from 'lucide-react'
import './TodoList.css'

type Todo = Database['public']['Tables']['todos']['Row']

interface TodoListProps {
  todos: Todo[]
  loading: boolean
  onAdd: (title: string) => Promise<void>
  onToggle: (id: string, completed: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function TodoList({ todos, loading, onAdd, onToggle, onDelete }: TodoListProps) {
  const [newTodo, setNewTodo] = useState('')
  const [adding, setAdding] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    setAdding(true)
    try {
      await onAdd(newTodo)
      setNewTodo('')
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return <div className="loading-container"><Loader2 className="spinner" /></div>
  }

  return (
    <div className="todo-container">
      <h2 className="todo-title">My Tasks</h2>
      
      <form onSubmit={handleAdd} className="add-todo-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          className="add-todo-input"
          disabled={adding}
        />
        <button type="submit" disabled={adding || !newTodo.trim()} className="add-todo-btn">
          {adding ? <Loader2 className="spinner" /> : <Plus />}
        </button>
      </form>

      <ul className="todo-list">
        {todos.length === 0 ? (
          <li className="empty-state">No tasks yet. Add one above!</li>
        ) : (
          todos.map((todo) => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <button 
                onClick={() => onToggle(todo.id, todo.completed)}
                className="toggle-btn-item"
              >
                {todo.completed ? (
                  <CheckCircle className="icon-check" />
                ) : (
                  <Circle className="icon-circle" />
                )}
              </button>
              <span className="todo-text">{todo.title}</span>
              <button 
                onClick={() => onDelete(todo.id)}
                className="delete-btn"
              >
                <Trash2 className="icon-trash" />
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
