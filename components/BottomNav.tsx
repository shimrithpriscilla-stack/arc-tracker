'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, TrendingUp, Plus, Settings, Droplets } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/progress', icon: TrendingUp, label: 'Progress' },
  { href: '/log/food', icon: Plus, label: 'Log', primary: true },
  { href: '/log/water', icon: Droplets, label: 'Water' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bottom-nav z-50">
      <div className="bg-[#1A1A2E] border-t border-white/10 px-2">
        <div className="flex items-center justify-around">
          {navItems.map(({ href, icon: Icon, label, primary }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 px-3 min-w-[60px] transition-all',
                  primary
                    ? 'relative'
                    : active ? 'text-[#FF6B35]' : 'text-gray-500'
                )}
              >
                {primary ? (
                  <div className="absolute -top-5 bg-[#FF6B35] rounded-full w-12 h-12 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Icon size={22} className="text-white" />
                  </div>
                ) : (
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                )}
                <span className={cn(
                  'text-[10px] font-medium',
                  primary && 'mt-6 text-gray-500',
                )}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
