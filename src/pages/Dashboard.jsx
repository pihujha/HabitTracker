import { useState, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useHabits } from '../hooks/useHabits'
import { useHabitLogs } from '../hooks/useHabitLogs'
import { useStreaks } from '../hooks/useStreaks'
import { useWeeklyStats } from '../hooks/useWeeklyStats'
import AddHabitModal from '../components/AddHabitModal'

export default function Dashboard() {
  const { habits, loading, addHabit, deleteHabit } = useHabits()
  const { logs, logMap, toggleLog, logProgress, today } = useHabitLogs()
  const [refreshKey, setRefreshKey] = useState(0)
  const streaks = useStreaks(habits, refreshKey)
  const { weeklyData, habitWeeklyData } = useWeeklyStats(habits, refreshKey)
  const [showModal, setShowModal] = useState(false)

  const handleToggle = async (habitId) => {
    await toggleLog(habitId)
    setRefreshKey(k => k + 1)
  }

  if (loading) return <p style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading...</p>

  const completedToday = logs.length
  const longestStreak = Math.max(0, ...Object.values(streaks))
  const todayLabel = new Date(today + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="page-content">

      {/* TODAY */}
      <section id="today">
        <h2 className="section-heading">Today</h2>
        <p className="section-date">{todayLabel}</p>

        <div className="stats-bar">
          <div className="stat-card">
            <span className="stat-value">{habits.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{completedToday} / {habits.length}</span>
            <span className="stat-label">Done today</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">🔥 {longestStreak}</span>
            <span className="stat-label">Best streak</span>
          </div>
        </div>

        {habits.length === 0 ? (
          <p className="empty-state">No habits yet — add one in the Habits section below.</p>
        ) : (
          <ul className="habit-list">
            {habits.map(habit =>
              habit.type === 'progress'
                ? <ProgressHabitRow
                    key={habit.id}
                    habit={habit}
                    value={logMap[habit.id] ?? null}
                    streak={streaks[habit.id] ?? 0}
                    onSave={async (v) => { await logProgress(habit.id, v); setRefreshKey(k => k + 1) }}
                  />
                : <BinaryHabitRow
                    key={habit.id}
                    habit={habit}
                    done={logs.includes(habit.id)}
                    streak={streaks[habit.id] ?? 0}
                    onToggle={() => handleToggle(habit.id)}
                  />
            )}
          </ul>
        )}
      </section>

      {/* INSIGHTS */}
      <section id="insights">
        <h2 className="section-heading">Insights</h2>
        {weeklyData.length > 0 ? (
          <div className="chart-card">
            <p className="chart-title">Completion rate — last 7 days</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weeklyData} barSize={28}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  formatter={v => [`${v}%`, 'Completion']}
                  contentStyle={{
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                  {weeklyData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.rate === 100
                          ? 'var(--accent)'
                          : entry.rate > 0
                          ? '#a5b4fc'
                          : 'var(--border)'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="empty-state">Add some habits to start seeing insights.</p>
        )}

        {habits.length > 0 && (
          <>
            <p className="insights-section-label">By habit — last 7 days</p>
            <div className="habit-breakdown">
              {habits.map(habit => {
                const data = habitWeeklyData[habit.id]
                if (!data) return null
                return (
                  <div key={habit.id} className="breakdown-row">
                    <span className="breakdown-name">{habit.name}</span>
                    <div className="breakdown-dots">
                      {data.days.map(({ date, value }) => (
                        <div
                          key={date}
                          className={`dot${value !== null ? ' done' : ''}`}
                          title={value !== null ? `${date}: ${value}%` : `${date}: not logged`}
                          style={value !== null && value < 100 ? { opacity: 0.4 + (value / 100) * 0.6 } : {}}
                        />
                      ))}
                    </div>
                    <span className="breakdown-count">{data.count}/7</span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </section>

      {/* HABITS */}
      <section id="habits">
        <div className="habits-header">
          <h2 className="section-heading" style={{ margin: 0 }}>Habits</h2>
          <button className="add-habit-btn" onClick={() => setShowModal(true)}>+ Add Habit</button>
        </div>

        {habits.length === 0 ? (
          <p className="empty-state">No habits yet. Add your first one!</p>
        ) : (
          <ul className="habit-list">
            {habits.map(habit => (
              <li key={habit.id} className="habit-item">
                <div style={{ flex: 1 }}>
                  <div className="habit-name">{habit.name}</div>
                  {habit.description && (
                    <div className="habit-description">{habit.description}</div>
                  )}
                </div>
                <button onClick={() => deleteHabit(habit.id)} className="delete-btn">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showModal && (
        <AddHabitModal onAdd={addHabit} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}

function BinaryHabitRow({ habit, done, streak, onToggle }) {
  return (
    <li className={`habit-item${done ? ' done' : ''}`}>
      <label className="habit-label">
        <input
          type="checkbox"
          className="habit-checkbox"
          checked={done}
          onChange={onToggle}
        />
        <span className={`habit-name${done ? ' done' : ''}`}>{habit.name}</span>
        {streak > 0 && <span className="streak-badge">🔥 {streak}</span>}
      </label>
    </li>
  )
}

function ProgressHabitRow({ habit, value, streak, onSave }) {
  const [input, setInput] = useState(value ?? '')
  const inputRef = useRef(null)

  const handleSave = () => {
    const v = Math.min(100, Math.max(0, Number(input) || 0))
    onSave(v)
  }

  const logged = value !== null
  const displayValue = logged ? value : 0

  return (
    <li className={`habit-item${logged ? ' done' : ''}`}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="progress-name">{habit.name}</span>
          {streak > 0 && <span className="streak-badge">🔥 {streak}</span>}
          <input
            ref={inputRef}
            type="number"
            min="0"
            max="100"
            className="progress-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="0"
          />
          <span className="progress-unit">%</span>
          <button className="progress-save" onClick={handleSave}>Save</button>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${displayValue}%` }} />
        </div>
      </div>
    </li>
  )
}
