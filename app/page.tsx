'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Moon, Sun, Dumbbell, UtensilsCrossed, Droplets, Scale, ChevronRight, Flame, Timer } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import MacroRing from '@/components/MacroRing'
import RaccoonMascot from '@/components/RaccoonMascot'
import MacroChallenges from '@/components/MacroChallenges'
import {
  getActiveSession, startSession, endSession,
  getSessionTotals, getUserSettings, upsertUserSettings,
  logSleep, getSessionFoodLogs, getSessionWorkoutLogs, getSessionWaterLogs,
  getWeightHistory,
} from '@/lib/queries'
import { getRaccoonMood, getRaccoonMessage, formatTime, hoursAgo, pct } from '@/lib/utils'
import type { SessionTotals } from '@/lib/queries'

const DEFAULT_SETTINGS = {
  target_calories: 1200,
  target_protein: 70,
  target_carbs: 150,
  target_fat: 40,
  target_water: 2500,
  goal_weight: 80,
}

export default function HomePage() {
  const [session, setSession] = useState<{ id: string; started_at: string; session_label: string | null } | null>(null)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [totals, setTotals] = useState<SessionTotals>({
    totalCalories: 0, totalProtein: 0, totalCarbs: 0,
    totalFat: 0, totalFiber: 0, totalWaterMl: 0, totalBurn: 0, workedOut: false,
  })
  const [recentFoods, setRecentFoods] = useState<Array<{ food_name: string; meal_type: string; logged_at: string }>>([])
  const [loading, setLoading] = useState(true)
  const [sleeping, setSleeping] = useState(false)
  const [currentWeight, setCurrentWeight] = useState<number | null>(null)
  const [raccoonMsg] = useState(() => {
    const mood = getRaccoonMood(0, 0, 0, false)
    return getRaccoonMessage(mood)
  })

  const load = useCallback(async () => {
    try {
      const [sess, sett] = await Promise.all([
        getActiveSession(),
        getUserSettings(),
      ])

      if (!sett) await upsertUserSettings({})
      const s = sett ?? DEFAULT_SETTINGS
      setSettings({
        target_calories: s.target_calories,
        target_protein: s.target_protein,
        target_carbs: s.target_carbs,
        target_fat: s.target_fat,
        target_water: s.target_water,
        goal_weight: s.goal_weight,
      })

      if (sess) {
        setSession(sess)
        const [t, foods] = await Promise.all([
          getSessionTotals(sess.id),
          getSessionFoodLogs(sess.id),
        ])
        setTotals(t)
        setRecentFoods(foods.slice(-3).reverse())
      }

      const weights = await getWeightHistory(7)
      if (weights.length > 0) setCurrentWeight(weights[weights.length - 1].weight_kg)
    } catch (e) {
      console.error('Load error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleStartSession = async () => {
    const sess = await startSession()
    setSession(sess)
    setTotals({ totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, totalFiber: 0, totalWaterMl: 0, totalBurn: 0, workedOut: false })
  }

  const handleSleep = async () => {
    if (!session) return
    setSleeping(true)
    try {
      await logSleep(session.id, new Date())
      await endSession(session.id)
      setSession(null)
    } catch (e) {
      console.error(e)
    } finally {
      setSleeping(false)
    }
  }

  const mood = getRaccoonMood(
    pct(totals.totalCalories, settings.target_calories),
    pct(totals.totalProtein, settings.target_protein),
    pct(totals.totalWaterMl, settings.target_water),
    totals.workedOut,
  )

  const sessionDuration = session
    ? Math.floor((Date.now() - new Date(session.started_at).getTime()) / 3600000)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F0F1A]">
        <div className="text-center">
          <div className="text-4xl mb-2">🦝</div>
          <p className="text-gray-400 text-sm">Loading Arc...</p>
        </div>
      </div>
    )
  }

  // No active session → wake-up screen
  if (!session) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex flex-col items-center justify-center p-6 gap-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🌅</div>
          <h1 className="text-2xl font-bold text-white mb-2">Good morning!</h1>
          <p className="text-gray-400 text-sm">Start a new session to begin tracking your day</p>
          {currentWeight && (
            <p className="text-gray-500 text-xs mt-2">Last weight: {currentWeight}kg → Goal: {settings.goal_weight}kg</p>
          )}
        </div>

        <button
          onClick={handleStartSession}
          className="w-full max-w-xs bg-[#FF6B35] text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-orange-500/30 active:scale-95 transition-transform"
        >
          <Sun size={24} />
          Start My Day
        </button>

        <Link href="/progress" className="text-gray-500 text-sm underline">
          View progress →
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0F0F1A] pb-28">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {session.session_label ?? 'Today'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1.5 text-xs text-green-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full pulse-brand" />
                Active · {sessionDuration}h in
              </span>
            </div>
          </div>
          <button
            onClick={handleSleep}
            disabled={sleeping}
            className="flex items-center gap-2 bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 text-sm font-medium px-3 py-2 rounded-xl active:scale-95 transition-transform"
          >
            <Moon size={16} />
            {sleeping ? 'Logging...' : 'Sleep'}
          </button>
        </div>

        {/* Weight & Goal bar */}
        {currentWeight && (
          <div className="mt-3 bg-[#1A1A2E] rounded-xl p-3 flex items-center gap-3">
            <Scale size={16} className="text-gray-400" />
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Current: <span className="text-white font-semibold">{currentWeight}kg</span></span>
                <span className="text-gray-400">Goal: <span className="text-[#FF6B35] font-semibold">{settings.goal_weight}kg</span></span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FF8C5A] rounded-full transition-all duration-1000"
                  style={{ width: `${Math.max(5, Math.min(100, ((92 - currentWeight) / (92 - settings.goal_weight)) * 100))}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">{(currentWeight - settings.goal_weight).toFixed(1)}kg to goal · {((92 - currentWeight) / (92 - settings.goal_weight) * 100).toFixed(0)}% of the way</p>
            </div>
          </div>
        )}
      </div>

      {/* Raccoon */}
      <div className="px-4 mb-4 slide-up">
        <RaccoonMascot mood={mood} message={raccoonMsg} />
      </div>

      {/* Macro Rings */}
      <div className="px-4 mb-4">
        <div className="bg-[#1A1A2E] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Today's Macros</h2>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Flame size={12} className="text-orange-400" />
              <span>{Math.round(totals.totalBurn)} burned</span>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1">
            <MacroRing value={totals.totalCalories} target={settings.target_calories} color="#FF6B35" label="Cal" unit="" />
            <MacroRing value={totals.totalProtein} target={settings.target_protein} color="#FF6B6B" label="Pro" unit="g" />
            <MacroRing value={totals.totalCarbs} target={settings.target_carbs} color="#4ECDC4" label="Carb" unit="g" />
            <MacroRing value={totals.totalFat} target={settings.target_fat} color="#FFE66D" label="Fat" unit="g" />
            <MacroRing value={totals.totalWaterMl} target={settings.target_water} color="#74B9FF" label="Water" unit="ml" />
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-xs text-gray-500">
            <span>Fiber: {Math.round(totals.totalFiber)}g</span>
            <span>Net: {Math.round(totals.totalCalories - totals.totalBurn)} kcal</span>
            <span>Water: {(totals.totalWaterMl/1000).toFixed(1)}L</span>
          </div>
        </div>
      </div>

      {/* Macro Challenges */}
      <div className="px-4 mb-4">
        <MacroChallenges
          totalCalories={totals.totalCalories}
          totalProtein={totals.totalProtein}
          totalCarbs={totals.totalCarbs}
          totalFat={totals.totalFat}
          totalFiber={totals.totalFiber}
          totalWaterMl={totals.totalWaterMl}
          totalBurn={totals.totalBurn}
          targets={settings}
        />
      </div>

      {/* Quick Log Grid */}
      <div className="px-4 mb-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Quick Log</h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { href: '/log/food', icon: UtensilsCrossed, label: 'Log Food', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', stat: `${Math.round(totals.totalCalories)} kcal` },
            { href: '/log/workout', icon: Dumbbell, label: 'Log Workout', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', stat: totals.workedOut ? '✓ Done today' : 'Not logged' },
            { href: '/log/water', icon: Droplets, label: 'Log Water', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', stat: `${(totals.totalWaterMl/1000).toFixed(1)}L / ${settings.target_water/1000}L` },
            { href: '/log/weight', icon: Scale, label: 'Log Weight', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', stat: currentWeight ? `${currentWeight}kg` : 'Not logged' },
          ].map(({ href, icon: Icon, label, color, bg, stat }) => (
            <Link
              key={href}
              href={href}
              className={`${bg} border rounded-2xl p-4 flex flex-col gap-2 active:scale-95 transition-transform`}
            >
              <div className="flex items-center justify-between">
                <Icon size={20} className={color} />
                <ChevronRight size={14} className="text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className={`text-xs ${color} mt-0.5`}>{stat}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Food */}
      {recentFoods.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Recent Food</h2>
            <Link href="/log/food" className="text-xs text-[#FF6B35]">See all</Link>
          </div>
          <div className="space-y-2">
            {recentFoods.map((f, i) => (
              <div key={i} className="bg-[#1A1A2E] rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">{f.food_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{f.meal_type}</p>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Timer size={10} />
                  {hoursAgo(f.logged_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sleep CTA */}
      <div className="px-4 mb-4">
        <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-200">Ready to sleep?</p>
            <p className="text-xs text-indigo-400 mt-0.5">Log sleep to close this session</p>
          </div>
          <div className="flex gap-2">
            <Link href="/log/sleep" className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-xl active:scale-95 transition-transform">
              Sleep Log
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
