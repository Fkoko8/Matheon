/** Nawigacja workspace'u MATHEON — jedno źródło prawdy dla sidebara i dolnego paska. */
export const navItems = [
  { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
  { label: 'Nauka', href: '/learn', icon: 'BookOpen' },
  { label: 'Bank zadań', href: '/tasks', icon: 'PencilLine' },
  { label: 'Arkusze', href: '/exams', icon: 'FileText' },
  { label: 'Powtórki', href: '/review', icon: 'RefreshCw' },
  { label: 'Moje błędy', href: '/mistakes', icon: 'Target' },
  { label: 'Plan nauki', href: '/plan', icon: 'CalendarDays' },
  { label: 'AI Tutor', href: '/ai', icon: 'Sparkles' },
  { label: 'Mapa wiedzy', href: '/map', icon: 'GitBranch' },
  { label: 'Statystyki', href: '/stats', icon: 'BarChart3' },
] as const
