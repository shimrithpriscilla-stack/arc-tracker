'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Scale, TrendingDown, TrendingUp, Minus, Plus, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getActiveSession, logWeight, getWeightHistory, getUserSettings } from '@/lib/queries'

export default function WeightLogPage() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [weight, setWeight] = useState(85.0)
  const [goalWeight, setGoalWeight] = useState(80)
  const [history, setHistory] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [sess, settings, hist] = await Promise.all([
      getActiveSession(),
      getUserSettings(),
      getWeightHistory(30),
    ])
    if (!sess) { router.push('/'); return }
    setSessionId(sess.id)
    if (settings?.goal_weight) setGoalWeight(settings.goal_weight)
    setHistory(hist)
    if (hist.length > 0) {
      setWeight(hist[hist.length - 1].weight_kg)
    }
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    try {
      const log = await logWeight(weight, sessionId ?? undefined)
      setHistory(prev => [...prev, log])
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const latestWeight = history.length > 0 ? history[history.length - 1].weight_kg : null
  const prevWeight = history.length > 1 ? history[history.length - 2].weight_kg : null
  const diff = latestWeight && prevWeight ? (latestWeight - prevWeight) : null
  const toGoal = latestWeight ? (latestWeight - goalWeight) : null

  const startWeight = 92
  const progressPct = latestWeight
    ? Math.max(0, Math.min(100, ((startWeight - latestWeight) / (startWeight - goalWeight)) * 100))
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F0F1A]">
        <Loader2 size={32} className="text-purple-400 animate-spin" />
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
            <h1 className="text-lg font-bold text-white">Log Weight</h1>
            <p className="text-xs text-gray-500">Winter Arc: 92kg → {goalWeight}kg</p>
          </div>
          {saved && (
            <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
              <CheckCircle size={16} /> Logged!
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-6 space-y-5">
        <div className="bg-[#1A1A2E] rounded-2xl p-4">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Start: <span className="text-white font-semibold">92kg</span></span>
            <span>Goal: <span className="text-[#FF6B35] font-semibold">{goalWeight}kg</span></span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-[#FF6B35] to-purple-500 rounded-full transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center">
            {progressPct.toFixed(1)}% of Winter Arc complete
            {toGoal ? ` · ${toGoal.toFixed(1)}kg to go` : ''}
          </p>
        </div>

        {diff !== null && (
          <div className={`flex items-center gap-3 rounded-2xl p-3 ${diff <= 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
            {diff <= 0
              ? <TrendingDown size={20} className="text-green-400" />
              : <TrendingUp size={20} className="text-red-400" />}
            <div>
              <p className={`text-sm font-semibold ${diff <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {diff <= 0 ? `Down ${Math.abs(diff).toFixed(1)}kg` : `Up ${diff.toFixed(1)}kg`}
              </p>
              <p className="text-xs text-gray-500">since last entry</p>
            </div>
          </div>
        )}

        <div className="bg-[#1A1A2E] rounded-2xl p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 text-center">
            Today's Weight
          </p>

          <div className="flex items-center gap-6 justify-center mb-6">
            <button
              onClick={() => setWeight(w => Math.max(40, parseFloat((w - 0.1).toFixed(1))))}
              className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20 transition-colors text-white"
            >
              <Minus size={22} />
            </button>

            <div className="text-center">
              <input
                type="number"
                value={weight}
                onChange={e => setWeight(parseFloat(e.target.value) || 0)}
                step="0.1"
                min="30"
                max="250"
                className="text-5xl font-bold text-white bg-transparent text-center w-32 focus:outline-none"
              />
              <p className="text-gray-500 text-lg font-medium -mt-1">kg</p>
            </div>

            <button
              onClick={() => setWeight(w => parseFloat((w + 0.1).toFixed(1)))}
              className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20 transition-colors text-white"
            >
              <Plus size={22} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            {[-1, -0.5, +0.5, +1].map(delta => (
              <button
                key={delta}
                onClick={() => setWeight(w => parseFloat((w + delta).toFixed(1)))}
                className="bg-white/5 border border-white/10 rounded-xl py-2 text-sm text-gray-300 font-medium active:bg-white/10 transition-colors"
              >
                {delta > 0 ? '+' : ''}{delta}
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-purple-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60 text-base"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Scale size={20} />}
            {saving ? 'Saving...' : `Log ${weight}kg`}
          </button>
        </div>

        {history.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Recent History</p>
            <div className="space-y-1">
              {[...history].reverse().slice(0, 7).map((entry: any, i) => {
                const prev = [...history].reverse()[i + 1]
                const d = prev ? (entry.weight_kg - prev.weight_kg) : null
                return (
                  <div key={entry.id} className="flex items-center justify-between bg-[#1A1A2E] rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Scale size={14} className="text-purple-400" />
                      <div>
                        <p className="text-sm font-bold text-white">{entry.weight_kg}kg</p>
                        <p className="text-[10px] text-gray-600">
                          {new Date(entry.logged_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    {d !== null && (
                      <span className={`text-xs font-semibold ${d < 0 ? 'text-green-400' : d > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                        {d > 0 ? '+' : ''}{d.toFixed(1)}kg
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-600 pb-4">
          Tip: Weigh yourself at the same time each morning for consistency
        </p>
      </div>
    </main>
  )
}
