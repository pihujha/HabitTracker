import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

export function useWeeklyStats(habits, refreshKey = 0) {
  const { user } = useAuth()
  const [weeklyData, setWeeklyData] = useState([])
  const [habitWeeklyData, setHabitWeeklyData] = useState({})

  useEffect(() => {
    if (!user || habits.length === 0) return
    fetchWeeklyData()
  }, [user, habits, refreshKey])

  async function fetchWeeklyData() {
    const days = getLast7Days()
    const start = days[0]
    const end = days[6]

    const { data } = await supabase
      .from('habit_logs')
      .select('habit_id, logged_date, value')
      .gte('logged_date', start)
      .lte('logged_date', end)

    // { date -> { habitId -> value } }
    const valuesByDate = {}
    for (const day of days) valuesByDate[day] = {}

    // { habitId -> { date -> value } }
    const valuesByHabit = {}
    for (const h of habits) valuesByHabit[h.id] = {}

    for (const row of data ?? []) {
      if (valuesByDate[row.logged_date])
        valuesByDate[row.logged_date][row.habit_id] = row.value
      if (valuesByHabit[row.habit_id])
        valuesByHabit[row.habit_id][row.logged_date] = row.value
    }

    const total = habits.length
    setWeeklyData(
      days.map((date) => {
        // sum actual values; missing habits contribute 0
        const valueSum = habits.reduce((sum, h) => {
          return sum + (valuesByDate[date][h.id] ?? 0)
        }, 0)
        const rate = total > 0 ? Math.round(valueSum / (total * 100) * 100) : 0
        return {
          date,
          label: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
          rate,
        }
      })
    )

    const perHabit = {}
    for (const h of habits) {
      const habitLogs = valuesByHabit[h.id]
      perHabit[h.id] = {
        days: days.map((date) => ({
          date,
          value: habitLogs[date] ?? null, // null = not logged
        })),
        // avg value across days where it was logged
        count: Object.keys(habitLogs).length,
      }
    }
    setHabitWeeklyData(perHabit)
  }

  return { weeklyData, habitWeeklyData }
}
