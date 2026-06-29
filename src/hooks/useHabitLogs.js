import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const today = new Date().toISOString().split('T')[0]

export function useHabitLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([]) // array of logged habit_ids for today

  useEffect(() => {
    if (!user) return
    fetchTodayLogs()
  }, [user])

  async function fetchTodayLogs() {
    const { data } = await supabase
      .from('habit_logs')
      .select('habit_id')
      .eq('logged_date', today)
    setLogs(data ? data.map((l) => l.habit_id) : [])
  }

  async function toggleLog(habitId) {
    const isDone = logs.includes(habitId)

    if (isDone) {
      await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('logged_date', today)
      setLogs((prev) => prev.filter((id) => id !== habitId))
    } else {
      await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, user_id: user.id, logged_date: today })
      setLogs((prev) => [...prev, habitId])
    }
  }

  return { logs, toggleLog, today }
}
