'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Droplets, Plus, Minus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getActiveSession, getSessionWaterLogs, logWater, getUserSettings } from '@/lib/queries'

const QUICK_AMOUNTS = [150, 200, 250, 300, 500, 750]

export default function WaterLogPage() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [waterLogs, setWaterLogs] = useState<any[]>([])
  const [target, setTarget] = useState(2500)
  const [custom, setCustom] = useState(250)
  const [logging, setLogging] = useState(false)
  const [loading, setLoading] = useState(true)
  const [flash, setFlash] = useState(false)

  const load = useCallback(async () => {
    const [sess, settings] = await Promise.all([getActiveSession(), getUserSettings()])
    if (!sess) { router.push('/'); return }
    setSessionId(sess.id)
    if (settings?.target_water) setTarget(settings.target_water)
    const logs = await getSessionWaterLogs(sess.id)
    setWaterLogs(logs)
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  const totalMl = waterLogs.reduce((s, w) => s + w.amount_ml, 0)
  const pct = Math.min((totalMl / target) * 100, 100)

  const handleLog = async (amount: number) => {
    if (!sessionId || logging) return
    setLogging(true)
    try {
      const newLog = await logWater(sessionId, amount)
      setWaterLogs(prev => [...prev, newLog])
      setFlash(true)
      setTimeout(() => setFlash(false), 400)
    } catch (e) {
      console.error(e)
    } finally {
      setLogging(false)
    }
  }

  const wavePct = Math.min(pct, 100)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F0F1A]">
        <Loader2 size={32} className="text-blue-400 animate-spin" />
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
          <div>
            <h1 className="text-lg font-bold text-white">Water Log</h1>
            <p className="text-xs text-gray-500">Stay hydrated 💧</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* Big water bottle visual */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="relative w-32 h-48 rounded-3xl overflow-hidden border-2 border-blue-500/30 bg-[#0A0A1A]"
            style={{ boxShadow: flash ? '0 0 30px rgba(116,185,255,0.4)' : '0 0 10px rgba(116,185,255,0.1)', transition: 'box-shadow 0.3s' }}
          >
            {/* Water fill */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400/70 transition-all duration-700"
              style={{ height: `${wavePct}%` }}
            />
            {/* Wave effect */}
            <div
              className="absolute left-0 right-0 h-4 bg-blue-400/30 rounded-full blur-sm transition-all duration-700"
              style={{ bottom: `calc(${wavePct}% - 8px)` }}
            />
            {/* Percentage */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Droplets size={24} className="text-white drop-shadow mb-1" />
              <span className="text-2xl font-bold text-white drop-shadow">{Math.round(pct)}%</span>
              <span className="text-xs text-white/70 drop-shadow">{(totalMl/1000).toFixed(1)}L</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              <span className="text-blue-400 font-bold text-lg">{totalMl}ml</span>
              {' '} / {target}ml
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {totalMl >= target ? '🎉 Goal reached!' : `${target - totalMl}ml to go`}
            </p>
          </div>
        </div>

        {/* Quick add buttons */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Quick Add</p>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_AMOUNTS.map(amount => (
              <button
                key={amount}
                onClick={() => handleLog(amount)}
                disabled={logging}
                className="bg-blue-500/10 border border-blue-500/20 text-blue-300 font-bold py-3 rounded-xl active:scale-95 active:bg-blue-500/20 transition-all disabled:opacity-40"
              >
                <span className="block text-lg">{amount < 1000 ? amount : `${amount/1000}L`}</span>
                <span className="block text-[10px] text-blue-400/70">ml</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div className="bg-[#1A1A2E] rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Custom Amount</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCustom(c => Math.max(50, c - 50))}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20 transition-colors"
            >
              <Minus size={18} className="text-white" />
            </button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-bold text-white">{custom}</span>
              <span className="text-gray-500 text-sm ml-1">ml</span>
            </div>
            <button
              onClick={() => setCustom(c => Math.min(2000, c + 50))}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20 transition-colors"
            >
              <Plus size={18} className="text-white" />
            </button>
          </div>
          <button
            onClick={() => handleLog(custom)}
            disabled={logging}
            className="w-full mt-3 bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40"
          >
            <Droplets size={18} />
            Add {custom}ml
          </button>
        </div>

        {/* Log history */}
        {waterLogs.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Today's Log</p>
            <div className="space-y-1">
              {[...waterLogs].reverse().slice(0, 8).map((log: any) => (
                <div key={log.id} className="flex items-center justify-between bg-[#1A1A2E] rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Droplets size={14} className="text-blue-400" />
                    <span className="text-sm text-white">{log.amount_ml}ml</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(log.logged_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
