import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useHabits() {
  const { user } = useAuth()
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchHabits()
  }, [user])

  async function fetchHabits() {
    const { data } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: true })
    setHabits(data ?? [])
    setLoading(false)
  }

  async function addHabit(name, description = '', type = 'binary') {
    const { data, error } = await supabase
      .from('habits')
      .insert({ name, description, type, user_id: user.id })
      .select()
      .single()
    if (!error) setHabits((prev) => [...prev, data])
    return error
  }

  async function deleteHabit(id) {
    const { error } = await supabase.from('habits').delete().eq('id', id)
    if (!error) setHabits((prev) => prev.filter((h) => h.id !== id))
    return error
  }

  return { habits, loading, addHabit, deleteHabit }
}
