import { supabase, requireUserId } from './supabase'
import type { Database } from './database.types'

type SessionRow = Database['public']['Tables']['sessions']['Row']
type FoodLogRow = Database['public']['Tables']['food_logs']['Row']
type WorkoutLogRow = Database['public']['Tables']['workout_logs']['Row']
type WaterLogRow = Database['public']['Tables']['water_logs']['Row']
type WeightLogRow = Database['public']['Tables']['weight_logs']['Row']
type SleepLogRow = Database['public']['Tables']['sleep_logs']['Row']
type UserSettingsRow = Database['public']['Tables']['user_settings']['Row']

// ── Sessions ──────────────────────────────────────────────────────────────────
// RLS handles user filtering on SELECTs; user_id is required on INSERTs

export async function getActiveSession(): Promise<SessionRow | null> {
  const { data } = await supabase
    .from('sessions')
    .select('*')
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as SessionRow | null
}

export async function startSession(): Promise<SessionRow> {
  const uid = await requireUserId()
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: uid,
      started_at: new Date().toISOString(),
      session_label: new Date().toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'short'
      }),
    })
    .select()
    .single()
  if (error) throw error
  return data as SessionRow
}

export async function endSession(sessionId: string, sleepStart?: Date): Promise<SessionRow> {
  const now = sleepStart ?? new Date()
  const { data, error } = await supabase
    .from('sessions')
    .update({ ended_at: now.toISOString() })
    .eq('id', sessionId)
    .select()
    .single()
  if (error) throw error
  return data as SessionRow
}

export async function getRecentSessions(limit = 7): Promise<SessionRow[]> {
  const { data } = await supabase
    .from('sessions')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as SessionRow[]
}

// ── User Settings ─────────────────────────────────────────────────────────────

export async function getUserSettings(): Promise<UserSettingsRow | null> {
  const { data } = await supabase
    .from('user_settings')
    .select('*')
    .maybeSingle()
  return data as UserSettingsRow | null
}

export async function upsertUserSettings(settings: {
  target_calories?: number
  target_protein?: number
  target_carbs?: number
  target_fat?: number
  target_water?: number
  goal_weight?: number
}) {
  const uid = await requireUserId()
  const { data: existing } = await supabase
    .from('user_settings')
    .select('id')
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('user_settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('user_id', uid)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from('user_settings')
      .insert({
        user_id: uid,
        target_calories: 1200,
        target_protein: 70,
        target_carbs: 150,
        target_fat: 40,
        target_water: 2500,
        goal_weight: 80,
        ...settings,
      })
      .select()
      .single()
    if (error) throw error
    return data
  }
}

// ── Food Logs ─────────────────────────────────────────────────────────────────

export async function getSessionFoodLogs(sessionId: string): Promise<FoodLogRow[]> {
  const { data } = await supabase
    .from('food_logs')
    .select('*')
    .eq('session_id', sessionId)
    .order('logged_at', { ascending: true })
  return (data ?? []) as FoodLogRow[]
}

export async function insertFoodLogs(sessionId: string, items: Array<{
  meal_type: string
  food_name: string
  calories?: number | null
  protein?: number | null
  carbs?: number | null
  fat?: number | null
  fiber?: number | null
}>): Promise<FoodLogRow[]> {
  const uid = await requireUserId()
  const rows = items.map(item => ({
    session_id: sessionId,
    user_id: uid,
    ...item,
    logged_at: new Date().toISOString(),
  }))
  const { data, error } = await supabase.from('food_logs').insert(rows).select()
  if (error) throw error
  return (data ?? []) as FoodLogRow[]
}

export async function deleteFoodLog(id: string) {
  await supabase.from('food_logs').delete().eq('id', id)
}

// ── Workout Logs ──────────────────────────────────────────────────────────────

export async function getSessionWorkoutLogs(sessionId: string): Promise<WorkoutLogRow[]> {
  const { data } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('session_id', sessionId)
    .order('logged_at', { ascending: true })
  return (data ?? []) as WorkoutLogRow[]
}

export async function insertWorkoutLogs(sessionId: string, exercises: Array<{
  exercise_name: string
  sets?: number | null
  reps?: number | null
  duration_minutes?: number | null
  calories_burned?: number | null
  notes?: string | null
}>): Promise<WorkoutLogRow[]> {
  const uid = await requireUserId()
  const rows = exercises.map(ex => ({
    session_id: sessionId,
    user_id: uid,
    ...ex,
    logged_at: new Date().toISOString(),
  }))
  const { data, error } = await supabase.from('workout_logs').insert(rows).select()
  if (error) throw error
  return (data ?? []) as WorkoutLogRow[]
}

// ── Water Logs ────────────────────────────────────────────────────────────────

export async function getSessionWaterLogs(sessionId: string): Promise<WaterLogRow[]> {
  const { data } = await supabase
    .from('water_logs')
    .select('*')
    .eq('session_id', sessionId)
    .order('logged_at', { ascending: true })
  return (data ?? []) as WaterLogRow[]
}

export async function logWater(sessionId: string, amount_ml: number): Promise<WaterLogRow> {
  const uid = await requireUserId()
  const { data, error } = await supabase
    .from('water_logs')
    .insert({ session_id: sessionId, user_id: uid, amount_ml, logged_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data as WaterLogRow
}

// ── Weight Logs ───────────────────────────────────────────────────────────────

export async function logWeight(weight_kg: number, sessionId?: string): Promise<WeightLogRow> {
  const uid = await requireUserId()
  const { data, error } = await supabase
    .from('weight_logs')
    .insert({
      user_id: uid,
      weight_kg,
      session_id: sessionId ?? null,
      logged_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data as WeightLogRow
}

export async function getWeightHistory(days = 30): Promise<WeightLogRow[]> {
  const since = new Date(Date.now() - days * 86400000).toISOString()
  const { data } = await supabase
    .from('weight_logs')
    .select('*')
    .gte('logged_at', since)
    .order('logged_at', { ascending: true })
  return (data ?? []) as WeightLogRow[]
}

// ── Sleep Logs ────────────────────────────────────────────────────────────────

export async function logSleep(sessionId: string, sleepStart: Date, sleepEnd?: Date, qualityRating?: number): Promise<SleepLogRow> {
  const uid = await requireUserId()
  const duration = sleepEnd
    ? (sleepEnd.getTime() - sleepStart.getTime()) / 3600000
    : null

  const { data, error } = await supabase
    .from('sleep_logs')
    .insert({
      session_id: sessionId,
      user_id: uid,
      sleep_start: sleepStart.toISOString(),
      sleep_end: sleepEnd?.toISOString() ?? null,
      duration_hours: duration,
      quality_rating: qualityRating ?? null,
      logged_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data as SleepLogRow
}

export async function getSessionSleepLog(sessionId: string): Promise<SleepLogRow | null> {
  const { data } = await supabase
    .from('sleep_logs')
    .select('*')
    .eq('session_id', sessionId)
    .order('logged_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as SleepLogRow | null
}

// ── Aggregates ────────────────────────────────────────────────────────────────

export type SessionTotals = {
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  totalFiber: number
  totalWaterMl: number
  totalBurn: number
  workedOut: boolean
}

export async function getSessionTotals(sessionId: string): Promise<SessionTotals> {
  const [foods, workouts, waters] = await Promise.all([
    getSessionFoodLogs(sessionId),
    getSessionWorkoutLogs(sessionId),
    getSessionWaterLogs(sessionId),
  ])

  return {
    totalCalories: foods.reduce((s, f) => s + (f.calories ?? 0), 0),
    totalProtein: foods.reduce((s, f) => s + (f.protein ?? 0), 0),
    totalCarbs: foods.reduce((s, f) => s + (f.carbs ?? 0), 0),
    totalFat: foods.reduce((s, f) => s + (f.fat ?? 0), 0),
    totalFiber: foods.reduce((s, f) => s + (f.fiber ?? 0), 0),
    totalWaterMl: waters.reduce((s, w) => s + w.amount_ml, 0),
    totalBurn: workouts.reduce((s, w) => s + (w.calories_burned ?? 0), 0),
    workedOut: workouts.length > 0,
  }
}
