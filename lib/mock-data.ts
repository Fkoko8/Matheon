export const navItems = [
  { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
  { label: 'Nauka', href: '/learn', icon: 'BookOpen' },
  { label: 'Zadania', href: '/tasks', icon: 'PencilLine' },
  { label: 'Arkusze', href: '/exams', icon: 'FileText' },
  { label: 'Powtórki', href: '/review', icon: 'RefreshCw' },
  { label: 'Plan nauki', href: '/plan', icon: 'CalendarDays' },
  { label: 'AI Tutor', href: '/ai', icon: 'Sparkles' },
  { label: 'Mapa wiedzy', href: '/map', icon: 'GitBranch' },
  { label: 'Statystyki', href: '/stats', icon: 'BarChart3' },
]
export const topics = [
  ['Algebra', '87%', '12 tematów', 'bg-violet-500'], ['Funkcje', '81%', '9 tematów', 'bg-blue-500'],
  ['Trygonometria', '74%', '8 tematów', 'bg-cyan-500'], ['Ciągi', '47%', '6 tematów', 'bg-amber-500'],
  ['Geometria analityczna', '52%', '10 tematów', 'bg-orange-500'], ['Prawdopodobieństwo', '41%', '7 tematów', 'bg-rose-500'],
]
export const activities = [
  { title: 'Powtórz logarytmy', meta: '15 min · 5 zadań', desc: 'Masz obecnie 47% mastery tego tematu.', icon: 'RefreshCw', tone: 'violet' },
  { title: 'Trygonometria — trening', meta: '20 min · poziom średni', desc: 'Utrwal ostatnio poznane wzory.', icon: 'Target', tone: 'blue' },
  { title: 'Twoje błędy', meta: '10 min · 4 zadania', desc: 'Wróć do zadań, które sprawiły Ci trudność.', icon: 'TriangleAlert', tone: 'amber' },
]
export const chapters = ['Liczby rzeczywiste', 'Wyrażenia algebraiczne', 'Równania i nierówności', 'Funkcje', 'Funkcja kwadratowa', 'Wielomiany', 'Ciągi', 'Trygonometria', 'Planimetria', 'Geometria', 'Statystyka i prawdopodobieństwo']
export const lessons = ['Definicja logarytmu', 'Podstawowe własności', 'Zmiana podstawy', 'Równania logarytmiczne', 'Nierówności logarytmiczne']
export const chartValues = [38, 52, 45, 70, 56, 78, 64]
export const icons = { LayoutDashboard: 'LayoutDashboard', BookOpen: 'BookOpen', PencilLine: 'PencilLine', FileText: 'FileText', RefreshCw: 'RefreshCw', CalendarDays: 'CalendarDays', Sparkles: 'Sparkles', GitBranch: 'GitBranch', BarChart3: 'BarChart3' }
export function getTopics() { return topics }
export function getLessons() { return lessons }
export function getUserProgress() { return { basic: 91, extended: 48, streak: 12 } }
export function getMistakes() { return [{ title: 'Geometria analityczna', count: 4 }, { title: 'Ciągi', count: 3 }, { title: 'Logarytmy', count: 2 }] }
export function getStudyPlan() { return activities }
