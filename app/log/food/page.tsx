'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ClipboardPaste, Trash2, CheckCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { parseChatGPTFood, type ParsedFoodItem } from '@/lib/utils'
import {
  getActiveSession, getSessionFoodLogs,
  insertFoodLogs, deleteFoodLog
} from '@/lib/queries'

const MEAL_COLORS: Record<string, string> = {
  breakfast: 'text-yellow-400 bg-yellow-400/10',
  lunch: 'text-orange-400 bg-orange-400/10',
  dinner: 'text-purple-400 bg-purple-400/10',
  snack: 'text-teal-400 bg-teal-400/10',
  pre_workout: 'text-red-400 bg-red-400/10',
  post_workout: 'text-green-400 bg-green-400/10',
}

const MEAL_EMOJI: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
  pre_workout: '💪',
  post_workout: '🥤',
}

export default function FoodLogPage() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [pasteText, setPasteText] = useState('')
  const [parsed, setParsed] = useState<ParsedFoodItem[]>([])
  const [loggedFoods, setLoggedFoods] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [showParsed, setShowParsed] = useState(true)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const sess = await getActiveSession()
    if (!sess) { router.push('/'); return }
    setSessionId(sess.id)
    const foods = await getSessionFoodLogs(sess.id)
    setLoggedFoods(foods)
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  const handleParse = () => {
    if (!pasteText.trim()) return
    const items = parseChatGPTFood(pasteText)
    if (items.length === 0) {
      setError('Nothing parseable found. Check the format below.')
    } else {
      setError('')
      setParsed(items)
      setSaved(false)
    }
  }

  const handleSave = async () => {
    if (!sessionId || parsed.length === 0) return
    setSaving(true)
    try {
      await insertFoodLogs(sessionId, parsed)
      const foods = await getSessionFoodLogs(sessionId)
      setLoggedFoods(foods)
      setParsed([])
      setPasteText('')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) {
      setError(e.message ?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteFoodLog(id)
    setLoggedFoods(prev => prev.filter(f => f.id !== id))
  }

  // Group logged foods by meal
  const grouped = loggedFoods.reduce((acc: Record<string, any[]>, f) => {
    const m = f.meal_type ?? 'snack'
    if (!acc[m]) acc[m] = []
    acc[m].push(f)
    return acc
  }, {})

  const totalCal = loggedFoods.reduce((s, f) => s + (f.calories ?? 0), 0)
  const totalProt = loggedFoods.reduce((s, f) => s + (f.protein ?? 0), 0)
  const totalCarbs = loggedFoods.reduce((s, f) => s + (f.carbs ?? 0), 0)
  const totalFat = loggedFoods.reduce((s, f) => s + (f.fat ?? 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F0F1A]">
        <Loader2 size={32} className="text-[#FF6B35] animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0F0F1A] pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0F0F1A]/95 backdrop-blur border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400 active:text-white transition-colors">
            <ArrowLeft size={22} />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Log Food</h1>
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
        {/* Today summary bar */}
        {loggedFoods.length > 0 && (
          <div className="bg-[#1A1A2E] rounded-2xl p-3 grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Cal', val: Math.round(totalCal), color: 'text-[#FF6B35]' },
              { label: 'Prot', val: `${Math.round(totalProt)}g`, color: 'text-[#FF6B6B]' },
              { label: 'Carb', val: `${Math.round(totalCarbs)}g`, color: 'text-[#4ECDC4]' },
              { label: 'Fat', val: `${Math.round(totalFat)}g`, color: 'text-[#FFE66D]' },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <p className={`text-base font-bold ${color}`}>{val}</p>
                <p className="text-[10px] text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Paste input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Paste ChatGPT Output
          </label>
          <textarea
            value={pasteText}
            onChange={e => { setPasteText(e.target.value); setParsed([]); setSaved(false) }}
            placeholder={`MEAL:Breakfast\nMasala oats|cal:310|prot:12|carbs:48|fat:8|fiber:5\n\nMEAL:Lunch\nDal + rice|cal:420|prot:16|carbs:72|fat:6|fiber:4`}
            className="w-full h-40 bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 font-mono resize-none focus:outline-none focus:border-[#FF6B35]/50"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <button
          onClick={handleParse}
          disabled={!pasteText.trim()}
          className="w-full bg-[#FF6B35] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40"
        >
          <ClipboardPaste size={18} />
          Parse Food
        </button>

        {/* Parsed preview */}
        {parsed.length > 0 && (
          <div className="bg-[#1A1A2E] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Preview ({parsed.length} items)</h3>
              <button onClick={() => setShowParsed(v => !v)} className="text-gray-500">
                {showParsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {showParsed && (
              <div className="space-y-2">
                {parsed.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 py-2 border-b border-white/5 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${MEAL_COLORS[item.meal_type] ?? 'text-gray-400 bg-white/5'}`}>
                          {MEAL_EMOJI[item.meal_type] ?? '🍽️'} {item.meal_type}
                        </span>
                      </div>
                      <p className="text-sm text-white leading-snug">{item.food_name}</p>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        {item.calories != null && <span className="text-[#FF6B35]">{item.calories}kcal</span>}
                        {item.protein != null && <span>P:{item.protein}g</span>}
                        {item.carbs != null && <span>C:{item.carbs}g</span>}
                        {item.fat != null && <span>F:{item.fat}g</span>}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Parsed totals */}
                <div className="pt-2 border-t border-white/10 grid grid-cols-4 gap-1 text-center text-xs">
                  {[
                    { l: 'Cal', v: Math.round(parsed.reduce((s,f) => s+(f.calories??0), 0)), c: 'text-[#FF6B35]' },
                    { l: 'Pro', v: `${Math.round(parsed.reduce((s,f) => s+(f.protein??0), 0))}g`, c: 'text-[#FF6B6B]' },
                    { l: 'Carb', v: `${Math.round(parsed.reduce((s,f) => s+(f.carbs??0), 0))}g`, c: 'text-[#4ECDC4]' },
                    { l: 'Fat', v: `${Math.round(parsed.reduce((s,f) => s+(f.fat??0), 0))}g`, c: 'text-[#FFE66D]' },
                  ].map(({l, v, c}) => (
                    <div key={l}>
                      <p className={`font-bold ${c}`}>{v}</p>
                      <p className="text-gray-600">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
              {saving ? 'Saving...' : `Log ${parsed.length} Items`}
            </button>
          </div>
        )}

        {/* Format guide */}
        <details className="group">
          <summary className="text-xs text-gray-500 cursor-pointer select-none list-none flex items-center gap-1">
            <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
            ChatGPT format guide
          </summary>
          <div className="mt-2 bg-[#1A1A2E] rounded-xl p-3 text-xs font-mono text-gray-400 space-y-1 leading-relaxed">
            <p className="text-[#FF6B35]">MEAL:Breakfast</p>
            <p>Masala oats|cal:310|prot:12|carbs:48|fat:8|fiber:5</p>
            <p className="text-[#FF6B35] mt-2">MEAL:Lunch</p>
            <p>Dal + rice|cal:420|prot:16|carbs:72|fat:6|fiber:4</p>
            <p className="text-gray-600 mt-2">Meal types: Breakfast, Lunch, Dinner, Snack, Pre_Workout, Post_Workout</p>
          </div>
        </details>

        {/* Logged foods */}
        {loggedFoods.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Logged Today</h3>
            {Object.entries(grouped).map(([meal, foods]) => (
              <div key={meal} className="bg-[#1A1A2E] rounded-2xl overflow-hidden">
                <div className={`px-4 py-2 flex items-center gap-2 ${MEAL_COLORS[meal] ?? 'text-gray-400'} bg-opacity-50`}>
                  <span>{MEAL_EMOJI[meal] ?? '🍽️'}</span>
                  <span className="text-xs font-bold uppercase tracking-wider capitalize">{meal}</span>
                  <span className="ml-auto text-xs opacity-60">
                    {Math.round(foods.reduce((s, f) => s + (f.calories ?? 0), 0))} kcal
                  </span>
                </div>
                <div className="divide-y divide-white/5">
                  {foods.map((f: any) => (
                    <div key={f.id} className="px-4 py-3 flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white leading-snug">{f.food_name}</p>
                        <div className="flex gap-3 mt-0.5 text-xs text-gray-500">
                          {f.calories != null && <span className="text-[#FF6B35]">{f.calories}kcal</span>}
                          {f.protein != null && <span>P:{f.protein}g</span>}
                          {f.carbs != null && <span>C:{f.carbs}g</span>}
                          {f.fat != null && <span>F:{f.fat}g</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="text-gray-600 active:text-red-400 transition-colors mt-0.5"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
