'use client'
import { AlertCircle, CheckCircle2, Zap } from 'lucide-react'

interface MacroChallengesProps {
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  totalFiber: number
  totalWaterMl: number
  totalBurn: number
  targets: {
    target_calories: number
    target_protein: number
    target_carbs: number
    target_fat: number
    target_water: number
  }
}

type Challenge = {
  type: 'critical' | 'warning' | 'success' | 'tip'
  message: string
  action?: string
}

function buildChallenges(props: MacroChallengesProps): Challenge[] {
  const {
    totalCalories, totalProtein, totalCarbs, totalFat,
    totalFiber, totalWaterMl, totalBurn, targets
  } = props
  const challenges: Challenge[] = []

  const netCal = totalCalories - totalBurn
  const proteinLeft = targets.target_protein - totalProtein
  const waterLeft = targets.target_water - totalWaterMl
  const calLeft = targets.target_calories - totalCalories

  // Critical: very low calorie + high burn
  if (totalBurn > 400 && totalCalories < 800) {
    challenges.push({
      type: 'critical',
      message: `Heavy session, very low intake (${Math.round(totalCalories)} kcal). Muscle loss risk — eat more!`,
      action: 'Log a protein-rich meal',
    })
  }

  // Protein gap
  if (proteinLeft > 20) {
    const foods = proteinLeft > 40
      ? '2 eggs + 100g paneer OR 200g chicken'
      : proteinLeft > 20
        ? '1 scoop protein shake OR 2 eggs'
        : '1 egg OR 50g paneer'
    challenges.push({
      type: 'warning',
      message: `${Math.round(proteinLeft)}g protein still needed.`,
      action: `Try: ${foods}`,
    })
  } else if (totalProtein >= targets.target_protein) {
    challenges.push({
      type: 'success',
      message: `Protein target hit! ${Math.round(totalProtein)}g / ${targets.target_protein}g ✓`,
    })
  }

  // Water
  if (waterLeft > 1000) {
    challenges.push({
      type: 'warning',
      message: `Only ${Math.round(totalWaterMl / 1000 * 10) / 10}L water. ${Math.round(waterLeft)}ml left.`,
      action: 'Drink 2 more glasses now',
    })
  } else if (waterLeft <= 0) {
    challenges.push({
      type: 'success',
      message: `Water goal smashed! ${Math.round(totalWaterMl)}ml ✓`,
    })
  }

  // Fiber low
  if (totalFiber < 10) {
    challenges.push({
      type: 'tip',
      message: `Low fiber (${Math.round(totalFiber)}g). Add veggies or a banana.`,
    })
  }

  // Calories: too low
  if (calLeft > 400 && totalBurn === 0) {
    challenges.push({
      type: 'tip',
      message: `${Math.round(calLeft)} kcal left for target. Still room for one meal.`,
    })
  }

  // Net deficit check
  if (netCal < 200 && totalBurn > 0) {
    challenges.push({
      type: 'critical',
      message: `Net intake is only ~${Math.round(netCal)} kcal. Recover or you'll burn muscle!`,
      action: 'Have a small protein meal before sleeping',
    })
  }

  // All good
  if (challenges.length === 0) {
    challenges.push({
      type: 'success',
      message: 'All macros on track. Keep it up!',
    })
  }

  return challenges
}

export default function MacroChallenges(props: MacroChallengesProps) {
  const challenges = buildChallenges(props)

  const icons = {
    critical: <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />,
    warning: <AlertCircle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />,
    success: <CheckCircle2 size={16} className="text-green-400 flex-shrink-0 mt-0.5" />,
    tip: <Zap size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />,
  }

  const colors = {
    critical: 'border-red-500/30 bg-red-500/10',
    warning: 'border-yellow-500/30 bg-yellow-500/10',
    success: 'border-green-500/30 bg-green-500/10',
    tip: 'border-blue-500/30 bg-blue-500/10',
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
        <Zap size={12} className="text-[#FF6B35]" />
        Macro Challenges
      </h3>
      {challenges.map((c, i) => (
        <div key={i} className={`rounded-xl p-3 border ${colors[c.type]} flex gap-2`}>
          {icons[c.type]}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white leading-snug">{c.message}</p>
            {c.action && (
              <p className="text-xs text-gray-400 mt-1 font-medium">→ {c.action}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
