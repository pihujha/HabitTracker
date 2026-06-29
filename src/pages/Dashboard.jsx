import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useHabits } from '../hooks/useHabits'
import { useHabitLogs } from '../hooks/useHabitLogs'
import { useStreaks } from '../hooks/useStreaks'
import { useWeeklyStats } from '../hooks/useWeeklyStats'

export default function Dashboard() {
  const { habits, loading, addHabit, deleteHabit } = useHabits()
  const { logs, toggleLog, today } = useHabitLogs()
  const streaks = useStreaks(habits)
  const weeklyData = useWeeklyStats(habits)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    const err = await addHabit(newName.trim())
    if (err) setError(err.message)
    else setNewName('')
  }

  if (loading) return <p>Loading habits...</p>

  const completedToday = logs.length
  const longestStreak = Math.max(0, ...Object.values(streaks))

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>My Habits</h2>
      <p style={styles.date}>
        {new Date(today + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>

      {/* Stats bar */}
      <div style={styles.statsBar}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{habits.length}</span>
          <span style={styles.statLabel}>Total habits</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{completedToday} / {habits.length}</span>
          <span style={styles.statLabel}>Done today</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>🔥 {longestStreak}</span>
          <span style={styles.statLabel}>Best streak</span>
        </div>
      </div>

      {/* 7-day chart */}
      {weeklyData.length > 0 && (
        <div style={styles.chartCard}>
          <p style={styles.chartTitle}>Last 7 days</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData} barSize={28}>
              <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Completion']}
                contentStyle={{ borderRadius: '8px', fontSize: '0.8rem' }}
              />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.rate === 100 ? '#4f46e5' : entry.rate > 0 ? '#a5b4fc' : '#e5e7eb'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Add habit form */}
      <form onSubmit={handleAdd} style={styles.form}>
        <input
          type="text"
          placeholder="New habit name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.addButton}>Add</button>
      </form>
      {error && <p style={styles.error}>{error}</p>}

      {habits.length === 0 ? (
        <p style={styles.empty}>No habits yet. Add one above!</p>
      ) : (
        <ul style={styles.list}>
          {habits.map((habit) => {
            const done = logs.includes(habit.id)
            return (
              <li key={habit.id} style={{ ...styles.item, backgroundColor: done ? '#f0fdf4' : '#fff' }}>
                <label style={styles.label}>
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => toggleLog(habit.id)}
                    style={styles.checkbox}
                  />
                  <span style={{ textDecoration: done ? 'line-through' : 'none', color: done ? '#888' : '#111' }}>
                    {habit.name}
                  </span>
                  {streaks[habit.id] > 0 && (
                    <span style={styles.streak}>🔥 {streaks[habit.id]}</span>
                  )}
                </label>
                <button onClick={() => deleteHabit(habit.id)} style={styles.deleteButton}>
                  Delete
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

const styles = {
  container: { maxWidth: '560px' },
  heading: { marginTop: 0, marginBottom: '0.25rem' },
  date: { margin: '0 0 1.25rem', color: '#666', fontSize: '0.9rem' },
  statsBar: { display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' },
  statCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.85rem',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    gap: '0.2rem',
  },
  statValue: { fontSize: '1.25rem', fontWeight: 600, color: '#111' },
  statLabel: { fontSize: '0.75rem', color: '#888' },
  chartCard: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '1rem 1rem 0.5rem',
    marginBottom: '1.25rem',
  },
  chartTitle: { margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#666', fontWeight: 500 },
  form: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' },
  input: {
    flex: 1,
    padding: '0.6rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
  },
  addButton: {
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#4f46e5',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  error: { color: '#e53e3e', fontSize: '0.875rem', margin: '0 0 1rem' },
  empty: { color: '#888' },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
  },
  label: { display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', flex: 1 },
  streak: { fontSize: '0.8rem', color: '#f97316' },
  checkbox: { width: '1rem', height: '1rem', cursor: 'pointer' },
  deleteButton: {
    padding: '0.3rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #fca5a5',
    backgroundColor: '#fff',
    color: '#e53e3e',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
}
