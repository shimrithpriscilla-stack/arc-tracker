'use client'
import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, TrendingDown, Scale, Droplets, Dumbbell, Flame, Moon, Loader2 } from 'lucide-react'
import Link from 'next/link'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts'
import { getWeightHistory, getRecentSessions } from '@/lib/queries'
import BottomNav from '@/components/BottomNav'

export default function ProgressPage() {
  const [weightHistory, setWeightHistory] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'weight' | 'sessions'>('weight')

  const load = useCallback(async () => {
    const [weights, sess] = await Promise.all([
      getWeightHistory(60),
      getRecentSessions(14),
    ])
    setWeightHistory(weights)
    setSessions(sess)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const weightData = weightHistory.map(w => ({
    date: new Date(w.logged_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    weight: w.weight_kg,
  }))

  const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight_kg : null
  const startWeight = weightHistory.length > 0 ? weightHistory[0].weight_kg : 92
  const totalLoss = latestWeight ? (startWeight - latestWeight) : 0
  const goalWeight = 80
  const toGoal = latestWeight ? (latestWeight - goalWeight) : null

  // Session stats
  const completedSessions = sessions.filter(s => s.ended_at)
  const avgSessionHours = completedSessions.length > 0
    ? completedSessions.reduce((s, sess) => {
        const dur = (new Date(sess.ended_at).getTime() - new Date(sess.started_at).getTime()) / 3600000
        return s + dur
      }, 0) / completedSessions.length
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F0F1A]">
        <Loader2 size={32} className="text-[#FF6B35] animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0F0F1A] pb-28">
      <div className="sticky top-0 z-10 bg-[#0F0F1A]/95 backdrop-blur border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400"><ArrowLeft size={22} /></Link>
          <h1 className="text-lg font-bold text-white">Progress</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Winter Arc header */}
        <div className="bg-gradient-to-br from-orange-500/20 to-purple-500/20 border border-orange-500/20 rounded-2xl p-4">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2">Winter Arc Progress</p>
          <div className="flex items-end gap-3 mb-3">
            <div>
              <p className="text-4xl font-bold text-white">{latestWeight ?? '—'}kg</p>
              <p className="text-xs text-gray-500 mt-0.5">current weight</p>
            </div>
            {totalLoss > 0 && (
              <div className="flex items-center gap-1 text-green-400 mb-1">
                <TrendingDown size={18} />
                <span className="text-lg font-bold">{totalLoss.toFixed(1)}kg lost</span>
              </div>
            )}
          </div>

          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Start: 92kg</span>
            <span>Goal: {goalWeight}kg</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF6B35] to-purple-500 rounded-full transition-all duration-1000"
              style={{
                width: latestWeight
                  ? `${Math.max(0, Math.min(100, ((92 - latestWeight) / (92 - goalWeight)) * 100))}%`
                  : '0%'
              }}
            />
          </div>
          {toGoal !== null && (
            <p className="text-xs text-gray-500 mt-1 text-center">{toGoal.toFixed(1)}kg to goal</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-[#1A1A2E] rounded-xl p-1">
          {[
            { key: 'weight', label: 'Weight Trend' },
            { key: 'sessions', label: 'Sessions' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-[#FF6B35] text-white'
                  : 'text-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'weight' && (
          <div className="space-y-4">
            {weightData.length >= 2 ? (
              <div className="bg-[#1A1A2E] rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-white mb-4">Weight (kg)</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={weightData}>
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      domain={['auto', 'auto']}
                      width={36}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1A1A2E',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12,
                        color: 'white',
                        fontSize: 12,
                      }}
                      formatter={(val: any) => [`${val}kg`, 'Weight']}
                    />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="#FF6B35"
                      strokeWidth={2}
                      fill="url(#weightGrad)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#FF6B35' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-[#1A1A2E] rounded-2xl p-8 text-center">
                <Scale size={32} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Log weight on 2+ days to see your trend</p>
                <Link href="/log/weight" className="inline-block mt-3 text-[#FF6B35] text-sm font-medium">
                  Log weight now →
                </Link>
              </div>
            )}

            {/* Weight entries */}
            {weightHistory.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">All Entries</p>
                {[...weightHistory].reverse().slice(0, 10).map((w: any, i, arr) => {
                  const prev = arr[i + 1]
                  const diff = prev ? w.weight_kg - prev.weight_kg : null
                  return (
                    <div key={w.id} className="flex items-center justify-between bg-[#1A1A2E] rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-white">{w.weight_kg}kg</p>
                        <p className="text-[10px] text-gray-600">
                          {new Date(w.logged_at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      {diff !== null && (
                        <span className={`text-xs font-semibold ${diff < 0 ? 'text-green-400' : diff > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)}kg
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {/* Stats row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#1A1A2E] rounded-2xl p-3 text-center">
                <p className="text-2xl font-bold text-[#FF6B35]">{sessions.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Sessions logged</p>
              </div>
              <div className="bg-[#1A1A2E] rounded-2xl p-3 text-center">
                <p className="text-2xl font-bold text-purple-400">{avgSessionHours.toFixed(1)}h</p>
                <p className="text-xs text-gray-500 mt-0.5">Avg session length</p>
              </div>
            </div>

            {/* Session list */}
            {sessions.length === 0 ? (
              <div className="bg-[#1A1A2E] rounded-2xl p-8 text-center">
                <Moon size={32} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No sessions yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((sess: any) => {
                  const start = new Date(sess.started_at)
                  const end = sess.ended_at ? new Date(sess.ended_at) : null
                  const dur = end ? ((end.getTime() - start.getTime()) / 3600000).toFixed(1) : null

                  return (
                    <div key={sess.id} className="bg-[#1A1A2E] rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {sess.session_label ?? start.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            {end && ` → ${end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`}
                          </p>
                        </div>
                        <div className="text-right">
                          {dur && <p className="text-sm font-bold text-gray-300">{dur}h</p>}
                          {!end && (
                            <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Active</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
