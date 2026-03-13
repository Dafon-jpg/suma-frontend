"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { createClient } from "@supabase/supabase-js"
import { SUMA_BLUE } from "@/lib/constants"
import { ShimmerButton } from "@/components/ui/shimmer-button"

// ─── TYPES ──────────────────────────────────────────────────────
type TransactionType = "expense" | "income" | "savings"
type ModalStep = 1 | 2 | 3

interface Category {
    id: string
    name: string
    icon: string | null
    user_id?: string | null
}

interface NewMovementModalProps {
    open: boolean
    onClose: () => void
    userId: string
    onSuccess: () => void
    editTransaction?: { id: string; type: TransactionType; amount: number; description: string; categoryId: string } | null
}

// ─── EMOJI PICKER ───────────────────────────────────────────────
const POPULAR_EMOJIS = [
    "🍕", "🏠", "🚗", "📱", "🎮", "🏥", "👕", "✈️",
    "📚", "🎬", "💪", "🐾", "🎵", "💼", "🔧", "🎁",
    "☕", "🍺", "💊", "🛒", "💡", "📦", "🏋️", "🎨",
]

export function NewMovementModal({ open, onClose, userId, onSuccess, editTransaction }: NewMovementModalProps) {
    const { i18n } = useTranslation()
    const isPt = i18n.language === "pt"

    const [step, setStep] = React.useState<ModalStep>(1)
    const [txType, setTxType] = React.useState<TransactionType>("expense")
    const [categoryId, setCategoryId] = React.useState<string>("")
    const [categories, setCategories] = React.useState<Category[]>([])
    const [amount, setAmount] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState("")
    const [currency, setCurrency] = React.useState("ARS")

    // New category inline
    const [showNewCat, setShowNewCat] = React.useState(false)
    const [newCatName, setNewCatName] = React.useState("")
    const [newCatIcon, setNewCatIcon] = React.useState("📦")
    const [savingCat, setSavingCat] = React.useState(false)

    // Category Management
    const [catMenuOpen, setCatMenuOpen] = React.useState<string | null>(null)
    const [editingCatId, setEditingCatId] = React.useState<string | null>(null)
    const [deletingCat, setDeletingCat] = React.useState<Category | null>(null)

    // Load categories
    React.useEffect(() => {
        if (!open) return
        const loadCategories = async () => {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            if (!supabaseUrl || !supabaseAnonKey) return

            const supabase = createClient(supabaseUrl, supabaseAnonKey)
            const { data } = await supabase
                .from("categories")
                .select("id, name, icon, user_id")
                .or(`user_id.is.null,user_id.eq.${userId}`)
                .order("user_id", { ascending: false, nullsFirst: false })
                .order("name", { ascending: true })

            if (data) {
                const uniqueCategories: Category[] = []
                const seenNames = new Set<string>()

                for (const cat of data) {
                    const lowerName = cat.name.toLowerCase()
                    if (!seenNames.has(lowerName)) {
                        seenNames.add(lowerName)
                        uniqueCategories.push(cat)
                    }
                }
                setCategories(uniqueCategories)
            }
        }
        loadCategories()
    }, [open, userId])

    // Reset on open or populate for edit
    React.useEffect(() => {
        if (open) {
            if (editTransaction) {
                setTxType(editTransaction.type)
                setAmount(String(editTransaction.amount))
                setDescription(editTransaction.description)
                setCategoryId(editTransaction.categoryId || "")
                setStep(3) // go directly to amount step for editing
            } else {
                setStep(1)
                setTxType("expense")
                setCategoryId("")
                setAmount("")
                setDescription("")
            }
            setError("")
            setShowNewCat(false)
        }
    }, [open, editTransaction])

    if (!open) return null

    const getSupabase = () => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        if (!url || !key) return null
        return createClient(url, key)
    }

    // ─── STEP 1: Choose type ───
    const handleTypeSelect = (type: TransactionType) => {
        setTxType(type)
        if (type === "expense") {
            setStep(2) // go to category selection
        } else {
            setStep(3) // skip to amount
        }
    }

    // ─── Save new category ───
    const handleSaveNewCategory = async () => {
        if (!newCatName.trim()) return

        const lowerNewName = newCatName.trim().toLowerCase()
        if (categories.some(c => c.name.toLowerCase() === lowerNewName)) {
            setError("¡Ya tenés una categoría con este nombre!")
            return
        }

        setError("")
        setSavingCat(true)

        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCatName.trim(), icon: newCatIcon, user_id: userId })
            })

            const json = await res.json()
            if (!res.ok) {
                throw new Error(json.error || "Error al crear en API")
            }

            setCategories((prev) => {
                const updated = [...prev, json.category]
                return updated.sort((a, b) => {
                    if (a.user_id && !b.user_id) return -1;
                    if (!a.user_id && b.user_id) return 1;
                    return a.name.localeCompare(b.name);
                })
            })
            setCategoryId(json.category.id)
            setShowNewCat(false)
            setNewCatName("")
            setSavingCat(false)
            return

        } catch (apiError: any) {
            console.log("API route failed, falling back:", apiError)

            // Check if error message dictates a unique constraint failure regardless of casing
            const errorMsg = apiError.message?.toLowerCase() || ""
            if (errorMsg.includes("duplicate key") || errorMsg.includes("uq_category_user") || errorMsg.includes("ya existe")) {
                setError("¡Ya tenés una categoría con este nombre!")
            } else {
                setError(`Error de BD: ${apiError.message}`)
            }
        }
        setSavingCat(false)
    }

    const handleDeleteCategory = async () => {
        if (!deletingCat) return
        setSavingCat(true)
        try {
            const res = await fetch(`/api/categories/${deletingCat.id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Error al eliminar la categoría")
            setCategories((prev) => prev.filter(c => c.id !== deletingCat.id))
            if (categoryId === deletingCat.id) setCategoryId("")
            setDeletingCat(null)
        } catch (err: any) {
            setError(`Error al eliminar: ${err.message}`)
        }
        setSavingCat(false)
    }

    const handleUpdateCategory = async () => {
        if (!editingCatId || !newCatName.trim()) return

        const lowerNewName = newCatName.trim().toLowerCase()
        if (categories.some(c => c.id !== editingCatId && c.name.toLowerCase() === lowerNewName)) {
            setError("Ya existe una categoría con ese nombre")
            return
        }

        setError("")
        setSavingCat(true)
        try {
            const res = await fetch(`/api/categories/${editingCatId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCatName.trim(), icon: newCatIcon })
            })
            const json = await res.json()
            if (!res.ok) {
                if (json.error?.toLowerCase()?.includes("duplicate key") || json.error?.includes("uq_category_user")) {
                    throw new Error("Ya existe una categoría con ese nombre")
                }
                throw new Error(json.error || "Error al actualizar")
            }

            setCategories((prev) => prev.map(c => c.id === editingCatId ? json.category : c))
            setEditingCatId(null)
            setShowNewCat(false)
            setNewCatName("")
        } catch (err: any) {
            setError(`Error al actualizar: ${err.message}`)
        }
        setSavingCat(false)
    }

    // ─── STEP 3: Submit transaction ───
    const handleSubmit = async () => {
        const numAmount = parseFloat(amount.replace(/,/g, "."))
        if (isNaN(numAmount) || numAmount <= 0) {
            setError("Ingresá un monto válido")
            return
        }

        setLoading(true)
        setError("")
        const supabase = getSupabase()
        if (!supabase) { setLoading(false); return }

        // We need an account_id — get the user's default account or create one
        let accountId: string | null = null
        const { data: accounts } = await supabase
            .from("accounts")
            .select("id")
            .eq("user_id", userId)
            .limit(1)

        if (accounts && accounts.length > 0) {
            accountId = accounts[0].id
        } else {
            // Create default account without currency as it might be failing by strict constraints or simply log errors.
            const { data: newAccount, error: accError } = await supabase
                .from("accounts")
                .insert({ user_id: userId, name: "General", type: "cash", is_default: true })
                .select("id")
                .single()

            if (accError) {
                console.error("Account creation error:", accError)
            }
            accountId = newAccount?.id || null
        }

        if (!accountId) {
            setError("Error al obtener la cuenta")
            setLoading(false)
            return
        }

        // Save type directly — savings is its own type now
        const dbType = txType
        const desc = description || (txType === "income" ? "Ingreso" : txType === "savings" ? "Ahorro" : "Gasto")

        const insertData: Record<string, unknown> = {
            user_id: userId,
            type: dbType,
            amount: numAmount,
            description: desc,
            account_id: accountId,
        }

        if (txType === "expense" && categoryId) {
            insertData.category_id = categoryId
        }

        if (txType === "savings") {
            insertData.currency = currency
        }

        if (editTransaction) {
            // UPDATE existing transaction
            const { error: txError } = await supabase
                .from("transactions")
                .update(insertData)
                .eq("id", editTransaction.id)

            if (txError) {
                setError(`Error: ${txError.message}`)
            } else {
                onSuccess()
                onClose()
            }
        } else {
            // INSERT new transaction
            const { error: txError } = await supabase
                .from("transactions")
                .insert(insertData)

            if (txError) {
                setError(`Error: ${txError.message}`)
            } else {
                onSuccess()
                onClose()
            }
        }
        setLoading(false)
    }

    const typeOptions: { type: TransactionType; label: string; emoji: string; color: string; desc: string }[] = [
        { type: "expense", label: "Gasto", emoji: "💸", color: "#EF4444", desc: "Registrá una compra o pago" },
        { type: "income", label: "Ingreso", emoji: "💰", color: "#22C55E", desc: "Sueldo, venta o cobro" },
        { type: "savings", label: "Ahorro", emoji: "🏦", color: SUMA_BLUE, desc: "Guardá para el futuro" },
    ]

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
            }}
        >
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                }}
            />

            {/* Modal */}
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "440px",
                    background: "white",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
                    maxHeight: "90vh",
                    overflowY: "auto",
                }}
            >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#111827", margin: 0 }}>
                        {step === 1 && "Nuevo movimiento"}
                        {step === 2 && "¿En qué categoría?"}
                        {step === 3 && (editTransaction ? `Editar ${txType === "expense" ? "gasto" : txType === "income" ? "ingreso" : "ahorro"}` : `Nuevo ${txType === "expense" ? "gasto" : txType === "income" ? "ingreso" : "ahorro"}`)}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            width: "32px", height: "32px", borderRadius: "50%",
                            border: "none", background: "#F3F4F6", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1.1rem", color: "#6B7280",
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Step indicator */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                    {[1, 2, 3].map((s) => (
                        <div key={s} style={{
                            flex: 1, height: "4px", borderRadius: "2px",
                            background: s <= step ? SUMA_BLUE : "#E5E7EB",
                            transition: "background 0.3s",
                        }} />
                    ))}
                </div>

                {/* ────── STEP 1: TYPE SELECTION ────── */}
                {step === 1 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {typeOptions.map((opt) => (
                            <button
                                key={opt.type}
                                onClick={() => handleTypeSelect(opt.type)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    padding: "1rem",
                                    borderRadius: "14px",
                                    border: "2px solid #E5E7EB",
                                    background: "white",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = opt.color
                                    e.currentTarget.style.transform = "translateY(-2px)"
                                    e.currentTarget.style.boxShadow = `0 4px 16px ${opt.color}20`
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "#E5E7EB"
                                    e.currentTarget.style.transform = "translateY(0)"
                                    e.currentTarget.style.boxShadow = "none"
                                }}
                            >
                                <span style={{ fontSize: "2rem" }}>{opt.emoji}</span>
                                <div>
                                    <p style={{ fontWeight: "600", fontSize: "1rem", color: "#111827", margin: 0 }}>{opt.label}</p>
                                    <p style={{ fontSize: "0.8rem", color: "#6B7280", margin: "0.15rem 0 0" }}>{opt.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* ────── STEP 2: CATEGORY SELECTION ────── */}
                {step === 2 && (
                    <div>
                        {deletingCat ? (
                            <div style={{ padding: "1.5rem", borderRadius: "16px", border: "2px solid #EF444430", background: "#FEF2F2", textAlign: "center", marginBottom: "1rem" }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🗑️</div>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#991B1B", marginBottom: "0.5rem", marginTop: 0 }}>¿Eliminar categoría?</h3>
                                <p style={{ fontSize: "0.9rem", color: "#B91C1C", marginBottom: "1.25rem" }}>
                                    Vas a eliminar <strong>{deletingCat.icon} {deletingCat.name}</strong>. Esta acción no se puede deshacer.
                                </p>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button
                                        onClick={() => setDeletingCat(null)}
                                        style={{ flex: 1, padding: "0.75rem", borderRadius: "10px", border: "1px solid #FECACA", background: "white", color: "#991B1B", fontWeight: "600", cursor: "pointer" }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDeleteCategory}
                                        disabled={savingCat}
                                        style={{ flex: 1, padding: "0.75rem", borderRadius: "10px", border: "none", background: "#EF4444", color: "white", fontWeight: "600", cursor: savingCat ? "not-allowed" : "pointer", opacity: savingCat ? 0.7 : 1 }}
                                    >
                                        {savingCat ? "Eliminando..." : "Sí, eliminar"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
                                {categories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        style={{
                                            position: "relative",
                                            display: "flex",
                                            borderRadius: "12px",
                                            border: `2px solid ${categoryId === cat.id ? SUMA_BLUE : "#E5E7EB"}`,
                                            background: categoryId === cat.id ? `${SUMA_BLUE}08` : "white",
                                            transition: "all 0.15s",
                                        }}
                                    >
                                        <button
                                            onClick={() => { setCategoryId(cat.id); setStep(3) }}
                                            style={{
                                                flex: 1,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.5rem",
                                                padding: "0.75rem",
                                                background: "transparent",
                                                border: "none",
                                                cursor: "pointer",
                                                fontSize: "0.9rem",
                                                color: "#111827",
                                                textAlign: "left",
                                                borderRadius: "12px",
                                            }}
                                        >
                                            <span style={{ fontSize: "1.2rem" }}>{cat.icon || "📦"}</span>
                                            <span style={{ fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.name}</span>
                                        </button>

                                        {cat.user_id === userId && (
                                            <div style={{ position: "relative" }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setCatMenuOpen(catMenuOpen === cat.id ? null : cat.id)
                                                    }}
                                                    style={{
                                                        padding: "0.75rem",
                                                        background: "transparent",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        color: "#6B7280",
                                                        borderRadius: "0 10px 10px 0",
                                                    }}
                                                >
                                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                    </svg>
                                                </button>
                                                {catMenuOpen === cat.id && (
                                                    <div style={{ position: "absolute", top: "100%", right: 0, zIndex: 10, background: "white", padding: "0.25rem", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", border: "1px solid #E5E7EB", width: "120px" }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setEditingCatId(cat.id)
                                                                setNewCatName(cat.name)
                                                                setNewCatIcon(cat.icon || "📦")
                                                                setShowNewCat(true)
                                                                setCatMenuOpen(null)
                                                            }}
                                                            style={{ display: "block", width: "100%", padding: "0.5rem", textAlign: "left", fontSize: "0.85rem", color: "#374151", background: "transparent", border: "none", cursor: "pointer", borderRadius: "4px" }}
                                                            onMouseEnter={(e) => e.currentTarget.style.background = "#F3F4F6"}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                                        >
                                                            ✎ Editar
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setDeletingCat(cat)
                                                                setCatMenuOpen(null)
                                                            }}
                                                            style={{ display: "block", width: "100%", padding: "0.5rem", textAlign: "left", fontSize: "0.85rem", color: "#DC2626", background: "transparent", border: "none", cursor: "pointer", borderRadius: "4px" }}
                                                            onMouseEnter={(e) => e.currentTarget.style.background = "#FEF2F2"}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                                        >
                                                            🗑️ Eliminar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add or Edit category */}
                        {!showNewCat ? (
                            !deletingCat && (
                                <button
                                    onClick={() => {
                                        setEditingCatId(null)
                                        setNewCatName("")
                                        setNewCatIcon("📦")
                                        setShowNewCat(true)
                                    }}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        borderRadius: "12px",
                                        border: "2px dashed #D1D5DB",
                                        background: "#FAFAFA",
                                        color: "#6B7280",
                                        fontSize: "0.85rem",
                                        fontWeight: "500",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    + Añadir categoría
                                </button>
                            )
                        ) : (
                            <div style={{ padding: "1rem", borderRadius: "12px", border: "2px solid #E5E7EB", background: "#F9FAFB" }}>
                                <p style={{ fontSize: "0.8rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                                    {editingCatId ? "Editar categoría" : "Nueva categoría"}
                                </p>
                                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                    <input
                                        type="text"
                                        placeholder="Nombre"
                                        value={newCatName}
                                        onChange={(e) => setNewCatName(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: "0.5rem 0.75rem",
                                            borderRadius: "8px",
                                            border: "2px solid #E5E7EB",
                                            fontSize: "0.9rem",
                                            outline: "none",
                                            color: "#111827",
                                        }}
                                    />
                                </div>
                                <p style={{ fontSize: "0.75rem", color: "#6B7280", marginBottom: "0.35rem" }}>Elegí un icono:</p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.75rem" }}>
                                    {POPULAR_EMOJIS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setNewCatIcon(emoji)}
                                            style={{
                                                width: "32px", height: "32px",
                                                borderRadius: "8px",
                                                border: newCatIcon === emoji ? `2px solid ${SUMA_BLUE}` : "2px solid transparent",
                                                background: newCatIcon === emoji ? `${SUMA_BLUE}10` : "transparent",
                                                cursor: "pointer",
                                                fontSize: "1.1rem",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button
                                        onClick={() => setShowNewCat(false)}
                                        style={{
                                            flex: 1, padding: "0.5rem", borderRadius: "8px",
                                            border: "1px solid #D1D5DB", background: "white",
                                            color: "#6B7280", fontSize: "0.85rem", cursor: "pointer",
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={editingCatId ? handleUpdateCategory : handleSaveNewCategory}
                                        disabled={savingCat || !newCatName.trim()}
                                        style={{
                                            flex: 1, padding: "0.5rem", borderRadius: "8px",
                                            border: "none", background: SUMA_BLUE,
                                            color: "white", fontSize: "0.85rem", fontWeight: "600",
                                            cursor: savingCat ? "not-allowed" : "pointer",
                                            opacity: savingCat || !newCatName.trim() ? 0.5 : 1,
                                        }}
                                    >
                                        {savingCat ? "Guardando..." : "Guardar"}
                                    </button>
                                </div>
                                {error && (
                                    <p style={{ color: "#EF4444", fontSize: "0.85rem", marginTop: "0.5rem", textAlign: "center" }}>{error}</p>
                                )}
                            </div>
                        )}

                        <button
                            onClick={() => setStep(1)}
                            style={{
                                width: "100%",
                                padding: "0.5rem",
                                border: "none",
                                background: "transparent",
                                color: "#6B7280",
                                fontSize: "0.85rem",
                                cursor: "pointer",
                                marginTop: "0.75rem",
                            }}
                        >
                            ← Volver
                        </button>
                    </div>
                )}

                {/* ────── STEP 3: AMOUNT + DESCRIPTION ────── */}
                {step === 3 && (
                    <div>
                        {txType === "savings" && (
                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "0.5rem" }}>
                                    Moneda
                                </label>
                                <p style={{ fontSize: "0.7rem", fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>Populares</p>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.35rem", marginBottom: "0.5rem" }}>
                                    {([
                                        { code: "ARS", label: "$" },
                                        { code: "USD", label: "US$" },
                                        { code: "EUR", label: "€" },
                                        { code: "BRL", label: "R$" },
                                        { code: "MXN", label: "MX$" },
                                        { code: "CLP", label: "CL$" },
                                        { code: "UYU", label: "UY$" },
                                        { code: "GBP", label: "£" },
                                    ] as const).map((c) => (
                                        <button
                                            key={c.code}
                                            onClick={() => setCurrency(c.code)}
                                            style={{
                                                padding: "0.5rem 0.25rem", borderRadius: "10px",
                                                border: `2px solid ${currency === c.code ? SUMA_BLUE : "#E5E7EB"}`,
                                                background: currency === c.code ? `${SUMA_BLUE}10` : "transparent",
                                                fontWeight: "600", fontSize: "0.8rem", color: "#111827", cursor: "pointer", transition: "all 0.2s",
                                                display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "0.1rem",
                                            }}
                                        >
                                            <span style={{ fontSize: "0.9rem" }}>{c.label}</span>
                                            <span style={{ fontSize: "0.65rem", color: "#6B7280" }}>{c.code}</span>
                                        </button>
                                    ))}
                                </div>
                                <p style={{ fontSize: "0.7rem", fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>Crypto</p>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.35rem" }}>
                                    {([
                                        { code: "BTC", label: "BTC", name: "Bitcoin" },
                                        { code: "SOL", label: "S", name: "Solana" },
                                        { code: "ETH", label: "ETH", name: "Ethereum" },
                                    ] as const).map((c) => (
                                        <button
                                            key={c.code}
                                            onClick={() => setCurrency(c.code)}
                                            style={{
                                                padding: "0.5rem 0.25rem", borderRadius: "10px",
                                                border: `2px solid ${currency === c.code ? SUMA_BLUE : "#E5E7EB"}`,
                                                background: currency === c.code ? `${SUMA_BLUE}10` : "transparent",
                                                fontWeight: "600", fontSize: "0.8rem", color: "#111827", cursor: "pointer", transition: "all 0.2s",
                                                display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "0.1rem",
                                            }}
                                        >
                                            <span style={{ fontSize: "0.9rem" }}>{c.label}</span>
                                            <span style={{ fontSize: "0.65rem", color: "#6B7280" }}>{c.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "0.25rem" }}>
                                Monto *
                            </label>
                            <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", fontSize: "1.1rem", color: "#6B7280", fontWeight: "600" }}>
                                    $
                                </span>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    autoFocus
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem 1rem 0.75rem 2rem",
                                        borderRadius: "12px",
                                        border: "2px solid #E5E7EB",
                                        fontSize: "1.5rem",
                                        fontWeight: "700",
                                        color: "#111827",
                                        outline: "none",
                                        transition: "border-color 0.2s",
                                        boxSizing: "border-box" as const,
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = SUMA_BLUE }}
                                    onBlur={(e) => { e.target.style.borderColor = "#E5E7EB" }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: "1.25rem" }}>
                            <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "0.25rem" }}>
                                Descripción (opcional)
                            </label>
                            <input
                                type="text"
                                placeholder="¿En qué fue?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "0.75rem 1rem",
                                    borderRadius: "12px",
                                    border: "2px solid #E5E7EB",
                                    fontSize: "1rem",
                                    color: "#111827",
                                    outline: "none",
                                    transition: "border-color 0.2s",
                                    boxSizing: "border-box" as const,
                                }}
                                onFocus={(e) => { e.target.style.borderColor = SUMA_BLUE }}
                                onBlur={(e) => { e.target.style.borderColor = "#E5E7EB" }}
                            />
                        </div>

                        {error && (
                            <p style={{ color: "#EF4444", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>
                        )}

                        <ShimmerButton
                            background={txType === "expense" ? "#EF4444" : txType === "income" ? "#22C55E" : SUMA_BLUE}
                            shimmerColor={txType === "expense" ? "#B91C1C" : txType === "income" ? "#15803D" : "#1E3A8A"}
                            borderRadius="12px"
                            className="w-full py-3 text-base font-semibold"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "Guardando..." : editTransaction ? "Guardar cambios" : `Registrar ${txType === "expense" ? "gasto" : txType === "income" ? "ingreso" : "ahorro"}`}
                        </ShimmerButton>

                        <button
                            onClick={() => setStep(txType === "expense" ? 2 : 1)}
                            style={{
                                width: "100%",
                                padding: "0.5rem",
                                border: "none",
                                background: "transparent",
                                color: "#6B7280",
                                fontSize: "0.85rem",
                                cursor: "pointer",
                                marginTop: "0.75rem",
                            }}
                        >
                            ← Volver
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
