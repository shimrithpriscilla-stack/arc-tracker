'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ClipboardPaste, Flame, Timer, CheckCircle, Dumbbell, Loader2, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { parseChatGPTWorkout } from '@/lib/utils'
import { getActiveSession, getSessionWorkoutLogs, insertWorkoutLogs } from '@/lib/queries'

export default function WorkoutLogPage() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [pasteText, setPasteText] = useState('')
  const [parsed, setParsed] = useState<ReturnType<typeof parseChatGPTWorkout> | null>(null)
  const [loggedWorkouts, setLoggedWorkouts] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const sess = await getActiveSession()
    if (!sess) { router.push('/'); return }
    setSessionId(sess.id)
    const workouts = await getSessionWorkoutLogs(sess.id)
    setLoggedWorkouts(workouts)
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  const handleParse = () => {
    if (!pasteText.trim()) return
    const result = parseChatGPTWorkout(pasteText)
    if (result.exercises.length === 0) {
      setError('No workout data found. Make sure the text starts with WORKOUT.')
    } else {
      setError('')
      setParsed(result)
      setSaved(false)
    }
  }

  const handleSave = async () => {
    if (!sessionId || !parsed || parsed.exercises.length === 0) return
    setSaving(true)
    try {
      await insertWorkoutLogs(sessionId, parsed.exercises)
      const workouts = await getSessionWorkoutLogs(sessionId)
      setLoggedWorkouts(workouts)
      setParsed(null)
      setPasteText('')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) {
      setError(e.message ?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const totalBurn = loggedWorkouts.reduce((s, w) => s + (w.calories_burned ?? 0), 0)
  const totalDuration = loggedWorkouts.reduce((s, w) => s + (w.duration_minutes ?? 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F0F1A]">
        <Loader2 size={32} className="text-[#FF6B35] animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0F0F1A] pb-10">
      <div className="sticky top-0 z-10 bg-[#0F0F1A]/95 backdrop-blur border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400">
            <ArrowLeft size={22} />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Log Workout</h1>
            <p className="text-xs text-gray-500">Paste from ChatGPT</p>
          </div>
          {saved && (
            <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
              <CheckCircle size={16} />
              Saved!
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {loggedWorkouts.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell size={16} className="text-red-400" />
              <span className="text-sm font-semibold text-white">Today's Session</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-[#FF6B35]">
                  <Flame size={20} />
                  {Math.round(totalBurn)}
                </div>
                <p className="text-xs text-gray-500 mt-1">kcal burned</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-400">
                  <Timer size={20} />
                  {Math.round(totalDuration)}
                </div>
                <p className="text-xs text-gray-500 mt-1">minutes</p>
              </div>
            </div>
            <div className="space-y-1">
              {loggedWorkouts.map((w: any) => (
                <div key={w.id} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm text-white">{w.exercise_name}</p>
                    <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                      {w.sets && <span>{w.sets} sets</span>}
                      {w.reps && <span>{w.reps} reps</span>}
                      {w.duration_minutes && <span>{w.duration_minutes}min</span>}
                    </div>
                  </div>
                  {w.calories_burned && (
                    <span className="text-xs text-[#FF6B35] font-semibold">{w.calories_burned} kcal</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {loggedWorkouts.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">💪</div>
            <p className="text-gray-500 text-sm">No workout logged yet today</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Paste ChatGPT Output
          </label>
          <textarea
            value={pasteText}
            onChange={e => { setPasteText(e.target.value); setParsed(null); setSaved(false) }}
            placeholder={`WORKOUT\nBench press|sets:4|reps:10|burn:120\nPull-ups|sets:3|reps:8|dur:20min|burn:80\nTOTAL:burn:350|dur:45min`}
            className="w-full h-36 bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 font-mono resize-none focus:outline-none focus:border-[#FF6B35]/50"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <button
          onClick={handleParse}
          disabled={!pasteText.trim()}
          className="w-full bg-[#FF6B35] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40"
        >
          <ClipboardPaste size={18} />
          Parse Workout
        </button>

        {parsed && (
          <div className="bg-[#1A1A2E] rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">Preview</h3>
            <div className="space-y-2">
              {parsed.exercises.map((ex, i) => (
                <div key={i} className="flex items-start justify-between gap-2 py-2 border-b border-white/5 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm text-white">{ex.exercise_name}</p>
                    <div className="flex gap-3 mt-0.5 text-xs text-gray-500">
                      {ex.sets && <span>{ex.sets} sets</span>}
                      {ex.reps && <span>{ex.reps} reps</span>}
                      {ex.duration_minutes && <span>{ex.duration_minutes}min</span>}
                    </div>
                  </div>
                  {ex.calories_burned && (
                    <span className="text-xs text-[#FF6B35] font-semibold">{ex.calories_burned} kcal</span>
                  )}
                </div>
              ))}
            </div>
            {(parsed.total_burn || parsed.total_duration) && (
              <div className="flex gap-4 pt-2 border-t border-white/10">
                {parsed.total_burn && (
                  <div className="flex items-center gap-1.5 text-sm text-[#FF6B35]">
                    <Flame size={14} />
                    <span className="font-bold">{parsed.total_burn}</span>
                    <span className="text-gray-500 text-xs">kcal</span>
                  </div>
                )}
                {parsed.total_duration && (
                  <div className="flex items-center gap-1.5 text-sm text-blue-400">
                    <Timer size={14} />
                    <span className="font-bold">{parsed.total_duration}</span>
                    <span className="text-gray-500 text-xs">min</span>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
              {saving ? 'Saving...' : 'Log Workout'}
            </button>
          </div>
        )}

        <details className="group">
          <summary className="text-xs text-gray-500 cursor-pointer select-none list-none flex items-center gap-1">
            <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
            ChatGPT format guide
          </summary>
          <div className="mt-2 bg-[#1A1A2E] rounded-xl p-3 text-xs font-mono text-gray-400 space-y-1 leading-relaxed">
            <p className="text-[#FF6B35]">WORKOUT</p>
            <p>Bench press|sets:4|reps:10|burn:120</p>
            <p>Running|dur:30min|burn:250</p>
            <p className="text-[#FF6B35]">TOTAL:burn:370|dur:45min</p>
          </div>
        </details>
      </div>
    </main>
  )
}
