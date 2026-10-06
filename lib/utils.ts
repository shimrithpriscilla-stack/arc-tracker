import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function hoursAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  if (hours === 0) return `${mins}m ago`
  if (mins === 0) return `${hours}h ago`
  return `${hours}h ${mins}m ago`
}

export function pct(value: number, target: number): number {
  return Math.min(Math.round((value / target) * 100), 150) // cap at 150%
}

export function macroColor(macro: 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber' | 'water'): string {
  const map = {
    calories: '#FF6B35',
    protein: '#FF6B6B',
    carbs: '#4ECDC4',
    fat: '#FFE66D',
    fiber: '#A8E6CF',
    water: '#74B9FF',
  }
  return map[macro]
}

export type ParsedFoodItem = {
  meal_type: string
  food_name: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  fiber: number | null
}

export type ParsedWorkoutItem = {
  exercise_name: string
  sets: number | null
  reps: number | null
  duration_minutes: number | null
  calories_burned: number | null
}

export type ParsedWorkout = {
  exercises: ParsedWorkoutItem[]
  total_burn: number | null
  total_duration: number | null
}

function parseNum(val: string): number | null {
  const n = parseFloat(val)
  return isNaN(n) ? null : n
}

export function parseChatGPTFood(text: string): ParsedFoodItem[] {
  const items: ParsedFoodItem[] = []
  let currentMeal = 'snack'

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  for (const line of lines) {
    if (line.startsWith('MEAL:')) {
      currentMeal = line.replace('MEAL:', '').trim().toLowerCase()
      continue
    }
    if (line === 'SKIP') continue
    if (line === 'WORKOUT') break

    if (line.includes('|')) {
      const parts = line.split('|')
      const food_name = parts[0].trim()
      if (!food_name || food_name.startsWith('TOTAL:')) continue

      const props: Record<string, string> = {}
      for (let i = 1; i < parts.length; i++) {
        const [key, val] = parts[i].split(':')
        if (key && val) props[key.trim()] = val.trim()
      }

      items.push({
        meal_type: currentMeal,
        food_name,
        calories: parseNum(props.cal ?? props.calories ?? ''),
        protein: parseNum(props.prot ?? props.protein ?? ''),
        carbs: parseNum(props.carbs ?? ''),
        fat: parseNum(props.fat ?? ''),
        fiber: parseNum(props.fiber ?? ''),
      })
    }
  }

  return items
}

export function parseChatGPTWorkout(text: string): ParsedWorkout {
  const exercises: ParsedWorkoutItem[] = []
  let total_burn: number | null = null
  let total_duration: number | null = null
  let inWorkout = false

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  for (const line of lines) {
    if (line === 'WORKOUT') {
      inWorkout = true
      continue
    }
    if (!inWorkout) continue

    if (line.startsWith('TOTAL:')) {
      const rest = line.replace('TOTAL:', '')
      const parts = rest.split('|')
      for (const p of parts) {
        const [k, v] = p.split(':')
        if (k === 'burn') total_burn = parseNum(v)
        if (k === 'dur') total_duration = parseNum(v?.replace('min', ''))
      }
      continue
    }

    if (line.includes('|')) {
      const parts = line.split('|')
      const exercise_name = parts[0].trim()
      if (!exercise_name) continue

      const props: Record<string, string> = {}
      for (let i = 1; i < parts.length; i++) {
        const [key, val] = parts[i].split(':')
        if (key && val) props[key.trim()] = val.trim()
      }

      exercises.push({
        exercise_name,
        sets: parseNum(props.sets ?? ''),
        reps: parseNum(props.reps ?? ''),
        duration_minutes: parseNum((props.dur ?? '').replace('min', '')),
        calories_burned: parseNum(props.burn ?? ''),
      })
    }
  }

  return { exercises, total_burn, total_duration }
}

export type RaccoonMood = 'thriving' | 'good' | 'meh' | 'struggling' | 'asleep'

export function getRaccoonMood(
  calPct: number,
  proteinPct: number,
  waterPct: number,
  workedOut: boolean
): RaccoonMood {
  const score =
    (proteinPct >= 80 ? 2 : proteinPct >= 50 ? 1 : 0) +
    (waterPct >= 80 ? 2 : waterPct >= 50 ? 1 : 0) +
    (workedOut ? 2 : 0) +
    (calPct >= 60 && calPct <= 110 ? 1 : 0)

  if (score >= 6) return 'thriving'
  if (score >= 4) return 'good'
  if (score >= 2) return 'meh'
  return 'struggling'
}

export const RACCOON_MESSAGES: Record<RaccoonMood, string[]> = {
  thriving: [
    "Winter Arc is ON. You're built different today 🔥",
    "Protein? Checked. Water? Checked. You? Unstoppable.",
    "This is what transformation looks like. Keep it up!",
  ],
  good: [
    "Solid session! Almost there — push the water a bit more.",
    "Good work today. One more meal to hit your protein.",
    "You're building something real. Don't stop now.",
  ],
  meh: [
    "Hey, still a day. Log something. Anything.",
    "Your future self is watching. Don't let them down.",
    "92→80 doesn't happen on rest days... or does it? Log your rest.",
  ],
  struggling: [
    "Rough one? That's okay. Just drink your water at least.",
    "Miss the gym, not your protein. Still time to eat something.",
    "Tomorrow is a new session. Tonight, just log and rest.",
  ],
  asleep: [
    "Sweet dreams, champion 🌙",
    "Recovery mode ON. Sleep is when the magic happens.",
    "Rest well. Your muscles are growing.",
  ],
}

export function getRaccoonMessage(mood: RaccoonMood): string {
  const msgs = RACCOON_MESSAGES[mood]
  return msgs[Math.floor(Math.random() * msgs.length)]
}
