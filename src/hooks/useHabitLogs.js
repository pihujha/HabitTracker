import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const today = new Date().toISOString().split('T')[0]

export function useHabitLogs() {
  const { user } = useAuth()
  // logMap: { [habitId]: value } — null means not logged today
  const [logMap, setLogMap] = useState({})

  useEffect(() => {
    if (!user) return
    fetchTodayLogs()
  }, [user])

  async function fetchTodayLogs() {
    const { data } = await supabase
      .from('habit_logs')
      .select('habit_id, value')
      .eq('logged_date', today)
    const map = {}
    for (const row of data ?? []) map[row.habit_id] = row.value
    setLogMap(map)
  }

  // Binary habits: toggle between logged (value=100) and not logged
  async function toggleLog(habitId) {
    const isLogged = habitId in logMap

    if (isLogged) {
      await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('logged_date', today)
      setLogMap(prev => {
        const next = { ...prev }
        delete next[habitId]
        return next
      })
    } else {
      await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, user_id: user.id, logged_date: today, value: 100 })
      setLogMap(prev => ({ ...prev, [habitId]: 100 }))
    }
  }

  // Progress habits: save a value (0 removes the log)
  async function logProgress(habitId, value) {
    if (value === 0) {
      await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('logged_date', today)
      setLogMap(prev => {
        const next = { ...prev }
        delete next[habitId]
        return next
      })
    } else {
      await supabase
        .from('habit_logs')
        .upsert(
          { habit_id: habitId, user_id: user.id, logged_date: today, value },
          { onConflict: 'habit_id,logged_date' }
        )
      setLogMap(prev => ({ ...prev, [habitId]: value }))
    }
  }

  // Convenience: array of logged habit_ids (used for streak/chart hooks)
  const logs = Object.keys(logMap)

  return { logs, logMap, toggleLog, logProgress, today }
}
