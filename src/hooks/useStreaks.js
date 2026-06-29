import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useStreaks(habits, refreshKey = 0) {
  const { user } = useAuth()
  const [streaks, setStreaks] = useState({}) // { habitId: number }

  useEffect(() => {
    if (!user || habits.length === 0) return
    fetchStreaks()
  }, [user, habits, refreshKey])

  async function fetchStreaks() {
    const habitIds = habits.map((h) => h.id)

    const { data } = await supabase
      .from('habit_logs')
      .select('habit_id, logged_date')
      .in('habit_id', habitIds)
      .order('logged_date', { ascending: false })

    if (!data) return

    const logsByHabit = {}
    for (const row of data) {
      if (!logsByHabit[row.habit_id]) logsByHabit[row.habit_id] = []
      logsByHabit[row.habit_id].push(row.logged_date)
    }

    const result = {}
    for (const habitId of habitIds) {
      result[habitId] = calcStreak(logsByHabit[habitId] ?? [])
    }
    setStreaks(result)
  }

  return streaks
}

function calcStreak(dates) {
  if (dates.length === 0) return 0

  const today = new Date().toISOString().split('T')[0]
  const sorted = [...dates].sort((a, b) => (a > b ? -1 : 1))

  // streak only counts if today or yesterday was logged
  if (sorted[0] < yesterday()) return 0

  let streak = 0
  let expected = today

  for (const date of sorted) {
    if (date === expected) {
      streak++
      expected = prevDay(expected)
    } else {
      break
    }
  }
  return streak
}

function prevDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function yesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}
