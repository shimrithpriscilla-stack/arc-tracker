'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Moon, Sun, Clock, CheckCircle, Loader2, Star } from 'lucide-react'
import Link from 'next/link'
import { getActiveSession, logSleep, getSessionSleepLog, endSession } from '@/lib/queries'

export default function SleepLogPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [existingLog, setExistingLog] = useState<any>(null)
  const [sleepTime, setSleepTime] = useState(() => {
    const now = new Date()
    now.setMinutes(0, 0, 0)
    return now.toISOString().slice(0, 16)
  })
  const [wakeTime, setWakeTime] = useState(() => {
    const now = new Date()
    now.setMinutes(0, 0, 0)
    return now.toISOString().slice(0, 16)
  })
  const [quality, setQuality] = useState(3)
  const [mode, setMode] = useState<'sleep' | 'both'>('sleep')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const sess = await getActiveSession()
    if (!sess) { router.push('/'); return }
    setSession(sess)
    try {
      const log = await getSessionSleepLog(sess.id)
      if (log) setExistingLog(log)
    } catch {}
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  const durationHours = () => {
    if (mode !== 'both') return null
    const sleep = new Date(sleepTime)
    const wake = new Date(wakeTime)
    const diff = (wake.getTime() - sleep.getTime()) / 3600000
    return diff > 0 ? diff.toFixed(1) : null
  }

  const handleSave = async () => {
    if (!session) return
    setSaving(true)
    try {
      const sleepDate = new Date(sleepTime)
      const wakeDate = mode === 'both' ? new Date(wakeTime) : undefined

      await logSleep(session.id, sleepDate, wakeDate, quality)
      await endSession(session.id, sleepDate)

      setSaved(true)
      setTimeout(() => router.push('/'), 1500)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F0F1A]">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    )
  }

  if (existingLog) {
    const duration = existingLog.duration_hours
    return (
      <main className="min-h-screen bg-[#0F0F1A] flex flex-col">
        <div className="sticky top-0 z-10 bg-[#0F0F1A]/95 backdrop-blur border-b border-white/5 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400"><ArrowLeft size={22} /></Link>
            <h1 className="text-lg font-bold text-white">Sleep Log</h1>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
          <div className="text-6xl">😴</div>
          <h2 className="text-xl font-bold text-white">Sleep already logged!</h2>
          {duration && (
            <p className="text-gray-400">You slept for <span className="text-indigo-400 font-semibold">{duration.toFixed(1)} hours</span></p>
          )}
          <p className="text-xs text-gray-600">Start a new session tomorrow to log more sleep.</p>
          <Link href="/" className="bg-[#FF6B35] text-white font-bold px-6 py-3 rounded-xl mt-4 active:scale-95 transition-transform">
            Go Home
          </Link>
        </div>
      </main>
    )
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0F0F1A] gap-4">
        <div className="text-6xl">🌙</div>
        <CheckCircle size={40} className="text-green-400" />
        <p className="text-white font-bold text-xl">Sleep logged!</p>
        <p className="text-gray-500 text-sm">Sweet dreams 😴</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0F0F1A] pb-10">
      <div className="sticky top-0 z-10 bg-[#0F0F1A]/95 backdrop-blur border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400"><ArrowLeft size={22} /></Link>
          <div>
            <h1 className="text-lg font-bold text-white">Sleep Log</h1>
            <p className="text-xs text-gray-500">This will close your current session</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-5">
        {/* Mode toggle */}
        <div className="bg-[#1A1A2E] rounded-2xl p-1 flex gap-1">
          {[
            { key: 'sleep', label: 'Just Sleep Time', icon: Moon },
            { key: 'both', label: 'Sleep + Wake', icon: Sun },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setMode(key as 'sleep' | 'both')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                mode === key
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-500'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Sleep time */}
        <div className="bg-[#1A1A2E] rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Moon size={16} className="text-indigo-400" />
            <span className="text-sm font-semibold text-white">Sleep Time</span>
          </div>
          <input
            type="datetime-local"
            value={sleepTime}
            onChange={e => setSleepTime(e.target.value)}
            className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50"
          />
          <p className="text-xs text-gray-600">When did you go to sleep?</p>
        </div>

        {/* Wake time (if both mode) */}
        {mode === 'both' && (
          <div className="bg-[#1A1A2E] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sun size={16} className="text-yellow-400" />
              <span className="text-sm font-semibold text-white">Wake Time</span>
            </div>
            <input
              type="datetime-local"
              value={wakeTime}
              onChange={e => setWakeTime(e.target.value)}
              className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50"
            />
            {durationHours() && (
              <div className="flex items-center gap-2 text-sm text-indigo-300">
                <Clock size={14} />
                <span>Duration: <strong>{durationHours()} hours</strong></span>
              </div>
            )}
          </div>
        )}

        {/* Quality rating */}
        <div className="bg-[#1A1A2E] rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-yellow-400" />
            <span className="text-sm font-semibold text-white">Sleep Quality</span>
          </div>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setQuality(n)}
                className={`text-2xl transition-transform active:scale-110 ${n <= quality ? '' : 'opacity-30'}`}
              >
                ⭐
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600 text-center">
            {quality === 1 && 'Terrible — barely slept'}
            {quality === 2 && 'Poor — kept waking up'}
            {quality === 3 && 'Okay — could be better'}
            {quality === 4 && 'Good — felt rested'}
            {quality === 5 && 'Great — fully recharged!'}
          </p>
        </div>

        {/* Warning */}
        <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-3 flex gap-2">
          <Moon size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-indigo-300">
            Logging sleep will <strong>close today's session</strong>. Start a new session tomorrow morning.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60 text-base"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <Moon size={20} />}
          {saving ? 'Logging...' : 'Log Sleep & Close Day'}
        </button>
      </div>
    </main>
  )
}
