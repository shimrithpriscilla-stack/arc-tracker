'use client'
import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Save, Target, Droplets, Scale, Flame, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getUserSettings, upsertUserSettings } from '@/lib/queries'
import BottomNav from '@/components/BottomNav'

interface SettingsForm {
  target_calories: number
  target_protein: number
  target_carbs: number
  target_fat: number
  target_water: number
  goal_weight: number
}

const DEFAULT: SettingsForm = {
  target_calories: 1200,
  target_protein: 70,
  target_carbs: 150,
  target_fat: 40,
  target_water: 2500,
  goal_weight: 80,
}

type FieldKey = keyof SettingsForm

interface FieldDef {
  key: FieldKey
  label: string
  unit: string
  icon: React.ReactNode
  color: string
  min: number
  max: number
  step: number
  hint: string
}

const FIELDS: FieldDef[] = [
  {
    key: 'target_calories', label: 'Daily Calories', unit: 'kcal',
    icon: <Flame size={16} />, color: 'text-[#FF6B35]',
    min: 800, max: 4000, step: 50,
    hint: 'Daily calorie target (typically 1200–1800 for weight loss)',
  },
  {
    key: 'target_protein', label: 'Protein', unit: 'g',
    icon: <span className="text-base">🥩</span>, color: 'text-[#FF6B6B]',
    min: 30, max: 300, step: 5,
    hint: 'Aim for 1.5–2g per kg of body weight',
  },
  {
    key: 'target_carbs', label: 'Carbohydrates', unit: 'g',
    icon: <span className="text-base">🍚</span>, color: 'text-[#4ECDC4]',
    min: 50, max: 500, step: 5,
    hint: 'Complex carbs for sustained energy',
  },
  {
    key: 'target_fat', label: 'Fat', unit: 'g',
    icon: <span className="text-base">🥑</span>, color: 'text-[#FFE66D]',
    min: 20, max: 200, step: 5,
    hint: 'Healthy fats are essential — don\'t go too low',
  },
  {
    key: 'target_water', label: 'Water Intake', unit: 'ml',
    icon: <Droplets size={16} />, color: 'text-[#74B9FF]',
    min: 1000, max: 5000, step: 250,
    hint: 'Recommended: 2–3L/day, more on workout days',
  },
  {
    key: 'goal_weight', label: 'Goal Weight', unit: 'kg',
    icon: <Scale size={16} />, color: 'text-purple-400',
    min: 40, max: 120, step: 0.5,
    hint: 'Your target weight for the Winter Arc',
  },
]

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsForm>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    const settings = await getUserSettings()
    if (settings) {
      setForm({
        target_calories: settings.target_calories,
        target_protein: settings.target_protein,
        target_carbs: settings.target_carbs,
        target_fat: settings.target_fat,
        target_water: settings.target_water,
        goal_weight: settings.goal_weight,
      })
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleChange = (key: FieldKey, value: number) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertUserSettings(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  // Auto-calc calories from macros
  const calcCalories = form.target_protein * 4 + form.target_carbs * 4 + form.target_fat * 9

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
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Settings</h1>
            <p className="text-xs text-gray-500">Daily targets & goals</p>
          </div>
          {saved && (
            <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
              <CheckCircle size={16} /> Saved!
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Macro balance hint */}
        <div className="bg-[#1A1A2E] rounded-2xl p-3 flex items-center gap-3">
          <Target size={18} className="text-[#FF6B35]" />
          <div className="flex-1">
            <p className="text-xs text-gray-400">Calories from macros</p>
            <p className="text-sm text-white">
              <span className="font-bold text-[#FF6B35]">{Math.round(calcCalories)}</span>
              <span className="text-gray-500"> kcal · target: {form.target_calories}</span>
            </p>
          </div>
          {Math.abs(calcCalories - form.target_calories) > 50 && (
            <span className="text-xs text-yellow-400 font-medium">Off by {Math.round(Math.abs(calcCalories - form.target_calories))} kcal</span>
          )}
        </div>

        {/* Settings fields */}
        {FIELDS.map(({ key, label, unit, icon, color, min, max, step, hint }) => (
          <div key={key} className="bg-[#1A1A2E] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={color}>{icon}</span>
                <span className="text-sm font-semibold text-white">{label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  value={form[key]}
                  onChange={e => handleChange(key, parseFloat(e.target.value) || 0)}
                  step={step}
                  min={min}
                  max={max}
                  className={`text-xl font-bold ${color} bg-transparent text-right w-20 focus:outline-none`}
                />
                <span className="text-xs text-gray-500">{unit}</span>
              </div>
            </div>

            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={form[key]}
              onChange={e => handleChange(key, parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #FF6B35 0%, #FF6B35 ${((form[key] - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((form[key] - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)`,
              }}
            />
            <div className="flex justify-between text-[10px] text-gray-600">
              <span>{min}{unit}</span>
              <span className="text-center text-gray-500 text-[10px]">{hint}</span>
              <span>{max}{unit}</span>
            </div>
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#FF6B35] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60 text-base"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>

        {/* App info */}
        <div className="text-center space-y-1 py-4">
          <p className="text-xs text-gray-600">Arc · Winter Arc Edition</p>
          <p className="text-xs text-gray-700">92kg → 80kg · Built for Shimrith 🦝</p>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
