import { useState } from 'react'

export default function AddHabitModal({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('binary')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const err = await onAdd(name.trim(), description.trim(), type)
    if (err) setError(err.message)
    else onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Habit</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Morning run"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Description <span className="form-optional">(optional)</span>
            </label>
            <textarea
              className="form-textarea"
              placeholder="What does this habit mean to you?"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tracking type</label>
            <div className="type-picker">
              <button
                type="button"
                className={`type-btn${type === 'binary' ? ' active' : ''}`}
                onClick={() => setType('binary')}
              >
                <span className="type-icon">✓</span>
                <span className="type-text">
                  <strong>Done / Not done</strong>
                  <small>You either do it or you don't</small>
                </span>
              </button>
              <button
                type="button"
                className={`type-btn${type === 'progress' ? ' active' : ''}`}
                onClick={() => setType('progress')}
              >
                <span className="type-icon">%</span>
                <span className="type-text">
                  <strong>Progress (0–100%)</strong>
                  <small>Log how much you completed</small>
                </span>
              </button>
            </div>
          </div>
          {error && <p className="login-error">{error}</p>}
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Add Habit</button>
          </div>
        </form>
      </div>
    </div>
  )
}
