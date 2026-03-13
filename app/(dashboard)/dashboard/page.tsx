"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { DoughnutChart } from "@/components/doughnut-chart"
import { LemonSqueezyModal } from "@/components/lemon-squeezy-modal"
import { Icons } from "@/components/icons"
import { useCurrency } from "@/lib/use-currency"
import { createClient } from "@supabase/supabase-js"
import { MOCK_USER_ID, SUMA_BLUE } from "@/lib/constants"
import Image from "next/image"
import { NewMovementModal } from "@/components/new-movement-modal"
import { AnimatedTabs } from "@/components/ui/animated-tabs"
import { SavingsBarChart } from "@/components/dashboard/savings-bar-chart"
import { Eye, EyeOff, Search } from "lucide-react"
import { motion, MotionConfig, AnimatePresence } from "framer-motion"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const MONTHS_SHORT_ES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
const MONTHS_SHORT_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]
const MONTHS_SHORT_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const MONTHS_MAP: Record<string, string[]> = { es: MONTHS_ES, pt: MONTHS_PT, en: MONTHS_EN }
const MONTHS_SHORT_MAP: Record<string, string[]> = { es: MONTHS_SHORT_ES, pt: MONTHS_SHORT_PT, en: MONTHS_SHORT_EN }

const CATEGORY_COLORS = [
  "#2A87CF","#1e6aa8","#60b5f7","#93c5fd","#3b82f6",
  "#a5d8ff","#0ea5e9","#38bdf8","#7dd3fc","#bae6fd",
]

const CURRENCY_LIST = [
  { code: "ARS", label: "Pesos", symbol: "$", group: "fiat" },
  { code: "USD", label: "Dólares", symbol: "US$", group: "fiat" },
  { code: "EUR", label: "Euros", symbol: "€", group: "fiat" },
  { code: "BRL", label: "Reales", symbol: "R$", group: "fiat" },
  { code: "MXN", label: "Pesos MX", symbol: "MX$", group: "fiat" },
  { code: "CLP", label: "Pesos CL", symbol: "CL$", group: "fiat" },
  { code: "UYU", label: "Pesos UY", symbol: "UY$", group: "fiat" },
  { code: "GBP", label: "Libras", symbol: "£", group: "fiat" },
  { code: "BTC", label: "Bitcoin", symbol: "BTC", group: "crypto" },
  { code: "SOL", label: "Solana", symbol: "S", group: "crypto" },
  { code: "ETH", label: "Ethereum", symbol: "ETH", group: "crypto" },
]

const VARIANTS = {
  top: { open: { rotate: ["0deg","0deg","45deg"], top: ["35%","50%","50%"] }, closed: { rotate: ["45deg","0deg","0deg"], top: ["50%","50%","35%"] } },
  middle: { open: { rotate: ["0deg","0deg","-45deg"] }, closed: { rotate: ["-45deg","0deg","0deg"] } },
  bottom: { open: { rotate: ["0deg","0deg","45deg"], bottom: ["35%","50%","50%"], left: "50%" }, closed: { rotate: ["45deg","0deg","0deg"], bottom: ["50%","50%","35%"], left: "calc(50% + 5px)" } },
}

interface Transaction {
  id: string; type: string; amount: number; description: string
  category_id: string | null; created_at: string; currency?: string
  categories?: { name: string; icon: string | null } | null
}
interface CategorySummary { label: string; value: number; color: string; emoji: string }

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  const { formatAmount } = useCurrency()
  const TreePine = Icons.treePine

  const [activeTab, setActiveTab] = React.useState(0)
  const [privacyMode, setPrivacyMode] = React.useState(false)
  const [filtersOpen, setFiltersOpen] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear())
  const [showNewMovement, setShowNewMovement] = React.useState(false)
  const [txToDelete, setTxToDelete] = React.useState<string | null>(null)
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [subscribing, setSubscribing] = React.useState(false)
  const [showLemonModal, setShowLemonModal] = React.useState(false)
  const [selectedSavingsCurrency, setSelectedSavingsCurrency] = React.useState("ARS")

  // Multiselect filters
  const [filterDateRange, setFilterDateRange] = React.useState<string>("all")
  const [filterTypes, setFilterTypes] = React.useState<Set<string>>(new Set())
  const [filterCategories, setFilterCategories] = React.useState<Set<string>>(new Set())

  const [loading, setLoading] = React.useState(true)
  const [userId, setUserId] = React.useState<string | null>(null)
  const [userName, setUserName] = React.useState("")
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [allTransactions, setAllTransactions] = React.useState<Transaction[]>([])
  const [categories, setCategories] = React.useState<CategorySummary[]>([])
  const [totalIncome, setTotalIncome] = React.useState(0)
  const [totalExpenses, setTotalExpenses] = React.useState(0)
  const [totalSavings, setTotalSavings] = React.useState(0)
  const [allCategories, setAllCategories] = React.useState<{id:string;name:string;icon:string|null}[]>([])
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null)
  const [editingTx, setEditingTx] = React.useState<{ id: string; type: "expense"|"income"|"savings"; amount: number; description: string; categoryId: string } | null>(null)

  const tableRef = React.useRef<HTMLDivElement>(null)
  const months = MONTHS_MAP[i18n.language] ?? MONTHS_ES
  const monthsShort = MONTHS_SHORT_MAP[i18n.language] ?? MONTHS_SHORT_ES
  const blurClass = privacyMode ? "blur-[8px] select-none" : ""
  const tabNames = (t("dashboard.tabs", { returnObjects: true }) as string[]) || ["Inicio", "Gastos", "Ahorro"]

  // Toggle helpers for multiselect
  const toggleType = (val: string) => {
    setFilterTypes(prev => { const n = new Set(prev); if (n.has(val)) n.delete(val); else n.add(val); return n })
  }
  const toggleCategory = (val: string) => {
    setFilterCategories(prev => { const n = new Set(prev); if (n.has(val)) n.delete(val); else n.add(val); return n })
  }

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("suma_user_id")
      if (stored) setUserId(stored)
      else window.location.href = "/registro"
    }
  }, [])

  React.useEffect(() => {
    if (!userId) return
    const fetchData = async () => {
      setLoading(true)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!supabaseUrl || !supabaseAnonKey) { setLoading(false); return }
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      const { data: userData } = await supabase.from("users").select("name").eq("id", userId).single()
      if (userData?.name) setUserName(userData.name.split(" ")[0])

      const startDate = new Date(currentYear, currentMonth, 1).toISOString()
      const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString()

      const { data: txData } = await supabase
        .from("transactions")
        .select("id, type, amount, description, category_id, created_at, currency, categories(name, icon)")
        .eq("user_id", userId)
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false })

      const txs = (txData || []) as unknown as Transaction[]
      setTransactions(txs)

      setTotalIncome(txs.filter(tx => tx.type === "income").reduce((s, tx) => s + Number(tx.amount), 0))
      setTotalExpenses(txs.filter(tx => tx.type === "expense").reduce((s, tx) => s + Number(tx.amount), 0))
      setTotalSavings(txs.filter(tx => tx.type === "savings").reduce((s, tx) => s + Number(tx.amount), 0))

      // Fetch ALL transactions for savings history chart
      const { data: allTxData } = await supabase
        .from("transactions")
        .select("id, type, amount, description, category_id, created_at, currency, categories(name, icon)")
        .eq("user_id", userId)
        .eq("type", "savings")
        .order("created_at", { ascending: true })
      setAllTransactions((allTxData || []) as unknown as Transaction[])

      const { data: catData } = await supabase.from("categories").select("id, name, icon, user_id").or(`user_id.is.null,user_id.eq.${userId}`)
      if (catData) {
        const unique: typeof catData = []
        const seen = new Set<string>()
        for (const c of catData.sort((a,b) => { if(a.user_id&&!b.user_id) return -1; if(!a.user_id&&b.user_id) return 1; return a.name.localeCompare(b.name) })) {
          if (!seen.has(c.name.toLowerCase())) { seen.add(c.name.toLowerCase()); unique.push(c) }
        }
        setAllCategories(unique)
      }

      const categoryMap = new Map<string, { total: number; emoji: string }>()
      if (catData) {
        const seen2 = new Set<string>()
        for (const cat of catData.sort((a,b) => { if(a.user_id&&!b.user_id) return -1; if(!a.user_id&&b.user_id) return 1; return a.name.localeCompare(b.name) })) {
          if (!seen2.has(cat.name.toLowerCase())) { seen2.add(cat.name.toLowerCase()); categoryMap.set(cat.name, { total: 0, emoji: cat.icon || "📦" }) }
        }
      }
      txs.filter(tx => tx.type === "expense").forEach(tx => {
        const n = tx.categories?.name || "Otros"; const ic = tx.categories?.icon || "📦"
        const ex = categoryMap.get(n)
        if (ex) ex.total += Number(tx.amount); else categoryMap.set(n, { total: Number(tx.amount), emoji: ic })
      })
      setCategories(Array.from(categoryMap.entries()).map(([label, data], i) => ({ label, value: data.total, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length], emoji: data.emoji })).filter(c => c.value > 0).sort((a,b) => b.value - a.value))
      setLoading(false)
    }
    fetchData()
  }, [userId, currentMonth, currentYear, refreshKey])

  const confirmDelete = async () => {
    if (!txToDelete) return
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return
    const supabase = createClient(url, key)
    await supabase.from("transactions").delete().eq("id", txToDelete)
    setMenuOpenId(null); setTxToDelete(null); setRefreshKey(k => k + 1)
  }

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTx({ id: tx.id, type: tx.type as "expense"|"income"|"savings", amount: Number(tx.amount), description: tx.description, categoryId: tx.category_id || "" })
    setShowNewMovement(true); setMenuOpenId(null)
  }

  const handleMonthChange = (dir: "prev"|"next") => {
    setSelectedCategory(null); setSearchQuery("")
    if (dir === "prev") { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y-1) } else setCurrentMonth(m => m-1) }
    else { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y+1) } else setCurrentMonth(m => m+1) }
  }

  const handleCategoryClick = (label: string | null) => {
    setSelectedCategory(label)
    if (label !== null) {
      setActiveTab(1) // Switch to Gastos tab
      setTimeout(() => tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200)
    }
  }

  const formatDate = (d: string) => { const dt = new Date(d); return `${dt.getDate().toString().padStart(2,"0")}/${(dt.getMonth()+1).toString().padStart(2,"0")}/${dt.getFullYear()}` }

  // Filtered transactions for Gastos tab (multiselect + date search)
  const filteredTx = React.useMemo(() => {
    let result = [...transactions]
    if (filterTypes.size > 0) result = result.filter(tx => filterTypes.has(tx.type))
    if (filterCategories.size > 0) result = result.filter(tx => filterCategories.has(tx.categories?.name || "Otros"))
    if (filterDateRange === "today") { const today = new Date().toDateString(); result = result.filter(tx => new Date(tx.created_at).toDateString() === today) }
    else if (filterDateRange === "week") { const w = Date.now() - 7*24*60*60*1000; result = result.filter(tx => new Date(tx.created_at).getTime() >= w) }
    else if (filterDateRange === "month") { const m = Date.now() - 30*24*60*60*1000; result = result.filter(tx => new Date(tx.created_at).getTime() >= m) }
    else if (filterDateRange === "year") { const y = Date.now() - 365*24*60*60*1000; result = result.filter(tx => new Date(tx.created_at).getTime() >= y) }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const allMonthNames = [...MONTHS_ES, ...MONTHS_PT, ...MONTHS_EN, ...MONTHS_SHORT_ES, ...MONTHS_SHORT_PT, ...MONTHS_SHORT_EN].map(m => m.toLowerCase())
      result = result.filter(tx => {
        if (tx.description.toLowerCase().includes(q)) return true
        if ((tx.categories?.name || "").toLowerCase().includes(q)) return true
        const txDate = new Date(tx.created_at)
        const monthName = months[txDate.getMonth()]?.toLowerCase() || ""
        const shortMonth = monthsShort[txDate.getMonth()]?.toLowerCase() || ""
        if (monthName.includes(q) || shortMonth.includes(q)) return true
        if (txDate.getFullYear().toString().includes(q)) return true
        if (formatDate(tx.created_at).includes(q)) return true
        return false
      })
    }
    if (selectedCategory) result = result.filter(tx => (tx.categories?.name || "Otros") === selectedCategory)
    return result
  }, [transactions, filterTypes, filterCategories, filterDateRange, searchQuery, selectedCategory, months, monthsShort])

  // Monthly savings history for bar chart
  const monthlySavingsData = React.useMemo(() => {
    const filtered = allTransactions.filter(tx => {
      const c = tx.currency || "ARS"
      return c === selectedSavingsCurrency
    })
    const monthMap = new Map<string, number>()
    filtered.forEach(tx => {
      const d = new Date(tx.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`
      monthMap.set(key, (monthMap.get(key) || 0) + Number(tx.amount))
    })
    const entries = Array.from(monthMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    const last12 = entries.slice(-12)
    return last12.map(([key, value]) => {
      const [y, m] = key.split("-")
      return { label: `${monthsShort[parseInt(m)]} ${y.slice(2)}`, value }
    })
  }, [allTransactions, selectedSavingsCurrency, monthsShort])

  const savingsByCurrency = React.useMemo(() => {
    const map = new Map<string, number>()
    transactions.filter(tx => tx.type === "savings").forEach(tx => {
      const c = tx.currency || "ARS"
      map.set(c, (map.get(c) || 0) + Number(tx.amount))
    })
    return map
  }, [transactions])

  const activeCurrencies = React.useMemo(() => {
    const codes = new Set(savingsByCurrency.keys())
    codes.add("ARS")
    return CURRENCY_LIST.filter(c => codes.has(c.code))
  }, [savingsByCurrency])

  const isInternational = i18n.language !== "es"
  const isEmpty = !loading && transactions.length === 0
  const isCurrentMonth = currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()
  const showCategoryFilter = filterTypes.has("expense") || filterTypes.size === 0

  const greetingPrefix = userName
    ? t("dashboard.greeting", { name: userName }).replace(" Suma.", "")
    : t("dashboard.greetingEmpty").replace(" Suma.", "")

  const renderTxRow = (tx: Transaction, showMenu = true) => (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0" style={{ background: tx.type === "expense" ? "#FEE2E2" : tx.type === "income" ? "#DCFCE7" : "#DBEAFE" }}>
        {tx.type === "expense" ? "💸" : tx.type === "income" ? "💰" : "🏦"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">{tx.description}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">{tx.categories?.icon || ""} {tx.categories?.name || "—"} · {formatDate(tx.created_at)}</p>
      </div>
      <span className={`text-sm font-bold whitespace-nowrap ${blurClass} ${tx.type === "expense" ? "text-red-500" : tx.type === "income" ? "text-green-500" : "text-suma-blue"}`}>
        {tx.type === "expense" ? "-" : "+"}{formatAmount(Number(tx.amount))}
      </span>
      {showMenu && (
        <div className="relative">
          <button onClick={() => setMenuOpenId(menuOpenId === tx.id ? null : tx.id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
          </button>
          {menuOpenId === tx.id && (
            <div className="absolute right-0 top-8 z-50 w-36 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1 animate-in fade-in slide-in-from-top-2">
              <button onClick={() => handleEditTransaction(tx)} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">✏️ {t("dashboard.edit")}</button>
              <button onClick={() => { setTxToDelete(tx.id); setMenuOpenId(null) }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">🗑️ {t("dashboard.delete")}</button>
            </div>
          )}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8 flex items-center justify-center" style={{ minHeight: "60vh" }}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-suma-blue border-t-transparent animate-spin mx-auto" />
          <p className="text-slate-500 dark:text-slate-400">{t("dashboard.loading")}</p>
        </div>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">{greetingPrefix} <span className="text-suma-blue">Suma.</span></h1>
          <a href="/settings" className="flex items-center gap-2 text-sm text-slate-500 hover:text-suma-blue transition-colors px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">⚙️ {t("dashboard.settings")}</a>
        </div>
        <div className="mt-12 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-3 mb-6" style={{ borderColor: `${SUMA_BLUE}30` }}>
            <Image src="/suma-avatar.png" alt="Suma" width={96} height={96} style={{ objectFit: "cover" }} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">{t("dashboard.emptyTitle")}</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">{t("dashboard.emptyDesc")} <strong className="text-suma-blue">&ldquo;{t("dashboard.emptyExample")}&rdquo;</strong> {t("dashboard.emptyCta")}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => window.open("https://wa.me/5491112345678?text=Hola","_blank")} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold" style={{ background: "#25D366" }}>📱 {t("dashboard.openWhatsapp")}</button>
            <button onClick={() => setShowNewMovement(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border-2 border-suma-blue text-suma-blue">{t("dashboard.firstMovement")}</button>
          </div>
        </div>
        {userId && <NewMovementModal open={showNewMovement} onClose={() => setShowNewMovement(false)} userId={userId} onSuccess={() => setRefreshKey(k => k+1)} />}
        <button onClick={() => setShowNewMovement(true)} className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-suma-blue hover:bg-[#1e6aa8] text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center hover:-translate-y-1 z-50" title={t("dashboard.firstMovement")}>
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        </button>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-slate-50 truncate">{greetingPrefix} <span className="text-suma-blue">Suma.</span></h1>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setPrivacyMode(!privacyMode)} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors" title={privacyMode ? t("dashboard.showAmounts") : t("dashboard.hideAmounts")}>
            {privacyMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
          <a href="/settings" className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
          </a>
        </div>
      </div>

      <AnimatedTabs tabs={tabNames} activeTab={activeTab} onChange={setActiveTab} />

      {/* ══════ TAB A: INICIO ══════ */}
      {activeTab === 0 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Balance Cards — 3 equal columns */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t("sidebar.income")}</p>
              <p className={`text-xl md:text-2xl font-bold text-green-600 dark:text-green-400 ${blurClass}`}>{formatAmount(totalIncome)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t("sidebar.spent")}</p>
              <p className={`text-xl md:text-2xl font-bold text-red-600 dark:text-red-400 ${blurClass}`}>{formatAmount(totalExpenses)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t("dashboard.balance")}</p>
              <p className={`text-xl md:text-2xl font-bold ${blurClass} ${totalIncome - totalExpenses >= 0 ? "text-suma-blue" : "text-red-500"}`}>{formatAmount(totalIncome - totalExpenses)}</p>
            </div>
          </div>

          {/* Doughnut Chart */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col items-center">
            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 self-start">{t("chart.title")} — {months[currentMonth]}</h2>
            {categories.length > 0 ? (
              <DoughnutChart key={`${currentMonth}-${currentYear}`} segments={categories} size={280} selectedCategory={selectedCategory} onCategoryClick={handleCategoryClick} />
            ) : (
              <p className="text-slate-400 text-sm py-8">{t("dashboard.noExpenses")}</p>
            )}
          </div>

          {/* Last 10 Movements */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("dashboard.lastMovements")}</h2>
            </div>
            {transactions.slice(0, 10).map(tx => <div key={tx.id}>{renderTxRow(tx)}</div>)}
            {transactions.length === 0 && <p className="text-sm text-slate-400 text-center py-8">{t("dashboard.noMovements")}</p>}
          </div>
        </div>
      )}

      {/* ══════ TAB B: GASTOS ══════ */}
      {activeTab === 1 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t("dashboard.searchPlaceholder")} className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-suma-blue/50 focus:border-suma-blue" />
            </div>
            <MotionConfig transition={{ duration: 0.5, ease: "easeInOut" }}>
              <motion.button initial={false} animate={filtersOpen ? "open" : "closed"} onClick={() => setFiltersOpen(pv => !pv)} className="relative h-12 w-12 rounded-full bg-sky-400/20 hover:bg-sky-400/40 shrink-0 flex items-center justify-center">
                <motion.span variants={VARIANTS.top} className="absolute h-0.5 w-6 bg-suma-blue" style={{ y: "-50%", left: "50%", x: "-50%", top: "35%" }} />
                <motion.span variants={VARIANTS.middle} className="absolute h-0.5 w-6 bg-suma-blue" style={{ left: "50%", x: "-50%", top: "50%", y: "-50%" }} />
                <motion.span variants={VARIANTS.bottom} className="absolute h-0.5 w-3 bg-suma-blue" style={{ x: "-50%", y: "50%", bottom: "35%", left: "calc(50% + 5px)" }} />
              </motion.button>
            </MotionConfig>
          </div>

          <AnimatePresence>
            {filtersOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 shadow-sm">
                  {/* Date */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("dashboard.filterDate")}</p>
                    <div className="flex flex-wrap gap-2">
                      {([["all","filterAll"],["today","filterToday"],["week","filterWeek"],["month","filterMonth"],["year","filterYear"]] as const).map(([val,key]) => (
                        <button key={val} onClick={() => setFilterDateRange(val)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${filterDateRange === val ? "bg-suma-blue text-white border-suma-blue" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-suma-blue"}`}>{t(`dashboard.${key}`)}</button>
                      ))}
                    </div>
                  </div>
                  {/* Type — Multiselect */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("dashboard.filterType")}</p>
                    <div className="flex flex-wrap gap-2">
                      {([["expense","filterExpense"],["income","filterIncome"],["savings","filterSavings"]] as const).map(([val,key]) => (
                        <label key={val} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${filterTypes.has(val) ? "bg-suma-blue text-white border-suma-blue" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-suma-blue"}`}>
                          <input type="checkbox" checked={filterTypes.has(val)} onChange={() => toggleType(val)} className="sr-only" />
                          {t(`dashboard.${key}`)}
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Category — Multiselect, only if expense selected or no type filter */}
                  {showCategoryFilter && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("dashboard.filterCategory")}</p>
                      <div className="flex flex-wrap gap-2">
                        {allCategories.map(c => (
                          <label key={c.id} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${filterCategories.has(c.name) ? "bg-suma-blue text-white border-suma-blue" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-suma-blue"}`}>
                            <input type="checkbox" checked={filterCategories.has(c.name)} onChange={() => toggleCategory(c.name)} className="sr-only" />
                            {c.icon || "📦"} {c.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <button onClick={() => { setFilterDateRange("all"); setFilterTypes(new Set()); setFilterCategories(new Set()); setSearchQuery(""); setSelectedCategory(null) }} className="text-xs text-suma-blue font-medium hover:underline">{t("dashboard.clearFilters")}</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active category filter banner */}
          {selectedCategory && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-suma-blue/10 border border-suma-blue/20">
              <span className="text-sm font-medium text-suma-blue">
                {t("table.movementsOf")} <strong>{selectedCategory}</strong>
              </span>
              <button onClick={() => setSelectedCategory(null)} className="flex items-center justify-center w-8 h-8 rounded-full bg-suma-blue text-white hover:bg-[#1e6aa8] transition-colors shadow-sm" title={t("table.clearFilter")}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          <div ref={tableRef} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden scroll-mt-24">
            <div className="max-h-[60vh] overflow-y-auto">
              {filteredTx.length > 0 ? filteredTx.map(tx => <div key={tx.id}>{renderTxRow(tx)}</div>) : (
                <p className="text-sm text-slate-400 text-center py-12">{t("dashboard.noResults")}{searchQuery && <> {t("dashboard.for")} <strong className="text-suma-blue">&quot;{searchQuery}&quot;</strong></>}</p>
              )}
            </div>
            {filteredTx.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                <span className="text-xs text-slate-500">{filteredTx.length} {filteredTx.length !== 1 ? t("table.movements") : t("table.movement")}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════ TAB C: AHORRO ══════ */}
      {activeTab === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Currency Dropdown */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">{t("dashboard.chartCurrency")}</label>
            <select value={selectedSavingsCurrency} onChange={e => setSelectedSavingsCurrency(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-suma-blue/50">
              {CURRENCY_LIST.map(c => <option key={c.code} value={c.code}>{c.symbol} — {c.label} ({c.code})</option>)}
            </select>
          </div>

          {/* Monthly Bar Chart */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TreePine className="h-4 w-4 text-suma-blue" /> {t("dashboard.monthlySavings")} — {CURRENCY_LIST.find(c => c.code === selectedSavingsCurrency)?.label}
            </h2>
            <SavingsBarChart data={monthlySavingsData} privacyMode={privacyMode} currencySymbol={CURRENCY_LIST.find(c => c.code === selectedSavingsCurrency)?.symbol} />
          </div>

          {/* Savings Title + Currency Cards */}
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{t("dashboard.savingsTotal")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeCurrencies.map(cur => {
              const total = savingsByCurrency.get(cur.code) || 0
              return (
                <div key={cur.code} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-suma-blue to-suma-light flex items-center justify-center text-white font-bold text-sm">{cur.symbol.slice(0, 3)}</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{cur.label}</p>
                      <p className="text-xs text-slate-400">{cur.code}</p>
                    </div>
                  </div>
                  {total > 0 ? (
                    <p className={`text-2xl font-bold text-suma-blue ${blurClass}`}>{cur.symbol}{total.toLocaleString("es-AR")}</p>
                  ) : (
                    <div className="text-center py-3">
                      <p className="text-sm text-slate-400 dark:text-slate-500">{t("dashboard.emptyWallet", { currency: cur.label })}</p>
                      <p className="text-xs text-slate-400 mt-1">{t("dashboard.emptyWalletCta")}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* SUMA PRO */}
      <div className="rounded-xl border border-suma-blue/30 bg-gradient-to-br from-suma-blue/5 to-suma-light/5 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div><h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{t("pro.title")}</h2><p className="text-sm text-slate-500 mt-1">{t("pro.description")} <strong className="text-suma-blue">{t("pro.price")}</strong>.</p></div>
          {isInternational ? (
            <button onClick={() => setShowLemonModal(true)} className="shrink-0 text-sm font-semibold text-white bg-suma-blue hover:bg-[#1e6aa8] px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-colors">🍋 {t("lemonSqueezy.button")}</button>
          ) : (
            <button onClick={async () => { setSubscribing(true); try { const res = await fetch("/api/mercadopago/create-subscription", { method: "POST" }); const data = await res.json(); if (data.url) window.location.href = data.url } catch (err) { console.error(err) } finally { setSubscribing(false) } }} disabled={subscribing} className="shrink-0 text-sm font-semibold text-white bg-suma-blue hover:bg-[#1e6aa8] disabled:opacity-60 px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-colors">
              {subscribing ? t("pro.processing") : t("pro.button")}
            </button>
          )}
        </div>
      </div>

      <LemonSqueezyModal open={showLemonModal} onClose={() => setShowLemonModal(false)} />
      {userId && <NewMovementModal open={showNewMovement} onClose={() => { setShowNewMovement(false); setEditingTx(null) }} userId={userId} onSuccess={() => setRefreshKey(k => k+1)} editTransaction={editingTx} />}

      <button onClick={() => setShowNewMovement(true)} className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-suma-blue hover:bg-[#1e6aa8] text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center hover:-translate-y-1 z-50" title={t("dashboard.firstMovement")}>
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
      </button>

      <AlertDialog open={!!txToDelete} onOpenChange={open => !open && setTxToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("dashboard.deleteDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("dashboard.cancel")}</AlertDialogCancel>
            {/* @ts-expect-error AlertDialogAction onClick works */}
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">{t("dashboard.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
