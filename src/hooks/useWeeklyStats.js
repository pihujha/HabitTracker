import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

export function useWeeklyStats(habits) {
  const { user } = useAuth()
  const [weeklyData, setWeeklyData] = useState([])

  useEffect(() => {
    if (!user || habits.length === 0) return
    fetchWeeklyData()
  }, [user, habits])

  async function fetchWeeklyData() {
    const days = getLast7Days()
    const start = days[0]
    const end = days[6]

    const { data } = await supabase
      .from('habit_logs')
      .select('habit_id, logged_date')
      .gte('logged_date', start)
      .lte('logged_date', end)

    const logsByDate = {}
    for (const day of days) logsByDate[day] = new Set()
    for (const row of data ?? []) {
      if (logsByDate[row.logged_date]) {
        logsByDate[row.logged_date].add(row.habit_id)
      }
    }

    const total = habits.length
    setWeeklyData(
      days.map((date) => ({
        date,
        label: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
        completed: logsByDate[date].size,
        total,
        rate: total > 0 ? Math.round((logsByDate[date].size / total) * 100) : 0,
      }))
    )
  }

  return weeklyData
}
