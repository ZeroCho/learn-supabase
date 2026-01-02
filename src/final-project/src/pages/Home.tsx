import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import type { Database } from '../types/database'
import Dashboard from '../components/Dashboard'
import TodoList from '../components/TodoList'
import { LogOut } from 'lucide-react'
import './Home.css'

type Todo = Database['public']['Tables']['todos']['Row']

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    getUser()
    fetchTodos()
    
    const channel = supabase
      .channel('todos_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        () => fetchTodos()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserEmail(user.email || null)
  }

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setTodos(data)
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (title: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await (supabase
      .from('todos') as any)
      .insert({
        title,
        user_id: user.id,
        completed: false
      } as any)

    if (error) throw error
    fetchTodos()
  }

  const handleToggle = async (id: string, completed: boolean) => {
    // Optimistic
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !completed } : t))
    
    const { error } = await (supabase
      .from('todos') as any)
      .update({ completed: !completed })
      .eq('id', id)

    if (error) {
      console.error('Error toggling:', error)
      fetchTodos() // Revert
    }
  }

  const handleDelete = async (id: string) => {
    // Optimistic
    setTodos(todos.filter(t => t.id !== id))

    const { error } = await (supabase
      .from('todos') as any)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting:', error)
      fetchTodos() // Revert
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="app-title">Supabase Todo App</h1>
        <div className="user-info">
          <span className="user-email">{userEmail}</span>
          <button onClick={handleSignOut} className="sign-out-btn">
            <LogOut className="icon-logout" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="home-main">
        <Dashboard todos={todos} />
        <TodoList 
          todos={todos} 
          loading={loading} 
          onAdd={handleAdd} 
          onToggle={handleToggle} 
          onDelete={handleDelete} 
        />
      </main>
    </div>
  )
}
