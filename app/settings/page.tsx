"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { MOCK_USER_ID, SUMA_BLUE } from "@/lib/constants"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import Image from "next/image"

export default function SettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = React.useState(true)
    const [saving, setSaving] = React.useState(false)
    const [success, setSuccess] = React.useState(false)
    const [error, setError] = React.useState("")

    const [userId, setUserId] = React.useState<string | null>(null)
    const [name, setName] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [phone, setPhone] = React.useState("")

    // Get user data
    React.useEffect(() => {
        const loadUser = async () => {
            const stored = typeof window !== "undefined" ? sessionStorage.getItem("suma_user_id") : null
            const uid = stored || MOCK_USER_ID
            setUserId(uid)

            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            if (!supabaseUrl || !supabaseAnonKey) { setLoading(false); return }

            const supabase = createClient(supabaseUrl, supabaseAnonKey)
            const { data } = await supabase
                .from("users")
                .select("name, email, phone")
                .eq("id", uid)
                .single()

            if (data) {
                setName(data.name || "")
                setEmail(data.email || "")
                setPhone(data.phone || "")
            }
            setLoading(false)
        }
        loadUser()
    }, [])

    const handleSave = async () => {
        if (!userId) return
        setSaving(true)
        setError("")
        setSuccess(false)

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (email && !emailRegex.test(email)) {
            setError("Ingresá un email válido")
            setSaving(false)
            return
        }

        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, email: email.trim(), name: name.trim() })
            })

            const json = await res.json()
            if (!res.ok) {
                throw new Error(json.error || "Error al actualizar")
            }

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err: any) {
            setError(`Error: ${err.message}`)
        }
        setSaving(false)
    }

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "0.75rem 1rem",
        borderRadius: "12px",
        border: "2px solid #E5E7EB",
        fontSize: "1rem",
        background: "#F9FAFB",
        color: "#111827",
        outline: "none",
        transition: "border-color 0.2s",
        boxSizing: "border-box" as const,
    }

    const labelStyle: React.CSSProperties = {
        fontSize: "0.85rem",
        fontWeight: "600",
        color: "#374151",
        marginBottom: "0.25rem",
        display: "block",
    }

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: `4px solid ${SUMA_BLUE}`, borderTopColor: "transparent", animation: "spin 1s linear infinite", margin: "0 auto" }} />
                    <p style={{ marginTop: "1rem", color: "#6B7280" }}>Cargando perfil...</p>
                </div>
            </div>
        )
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#FFFFFF",
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                padding: "1.5rem",
            }}
        >
            <div style={{ width: "100%", maxWidth: "440px" }}>
                {/* Back arrow — top left */}
                <button
                    onClick={() => router.push("/dashboard")}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 1rem",
                        borderRadius: "12px",
                        border: "none",
                        background: "#F3F4F6",
                        color: "#374151",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        cursor: "pointer",
                        marginBottom: "1.5rem",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#E5E7EB"; e.currentTarget.style.color = SUMA_BLUE }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#374151" }}
                >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Volver al Dashboard
                </button>

                {/* Avatar */}
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    <div
                        style={{
                            width: "80px", height: "80px", borderRadius: "50%",
                            overflow: "hidden", margin: "0 auto 1rem",
                            border: `3px solid ${SUMA_BLUE}20`,
                        }}
                    >
                        <Image src="/suma-avatar.png" alt="Suma" width={80} height={80} style={{ objectFit: "cover" }} />
                    </div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#111827", margin: "0 0 0.25rem" }}>
                        Ajustes de Perfil
                    </h1>
                    <p style={{ fontSize: "0.9rem", color: "#6B7280", margin: 0 }}>
                        Actualizá tu información personal
                    </p>
                </div>

                {/* Form */}
                <div style={{ marginBottom: "0.75rem", textAlign: "left" }}>
                    <label style={labelStyle}>Nombre completo</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={inputStyle}
                        onFocus={(e) => { e.target.style.borderColor = SUMA_BLUE; e.target.style.background = "#FFF" }}
                        onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.background = "#F9FAFB" }}
                    />
                </div>

                <div style={{ marginBottom: "0.75rem", textAlign: "left" }}>
                    <label style={labelStyle}>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        style={inputStyle}
                        onFocus={(e) => { e.target.style.borderColor = SUMA_BLUE; e.target.style.background = "#FFF" }}
                        onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.background = "#F9FAFB" }}
                    />
                </div>

                <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
                    <label style={labelStyle}>Teléfono</label>
                    <input
                        type="tel"
                        value={phone}
                        disabled
                        style={{
                            ...inputStyle,
                            color: "#9CA3AF",
                            cursor: "not-allowed",
                        }}
                    />
                    <p style={{ fontSize: "0.75rem", color: "#9CA3AF", marginTop: "0.25rem" }}>
                        El teléfono no se puede cambiar ya que está vinculado a tu WhatsApp
                    </p>
                </div>

                {error && (
                    <p style={{ color: "#EF4444", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>
                )}

                {success && (
                    <div style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "12px",
                        background: "#ECFDF5",
                        border: "1px solid #A7F3D0",
                        color: "#065F46",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        marginBottom: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}>
                        ✓ Cambios guardados correctamente
                    </div>
                )}

                <ShimmerButton
                    background={SUMA_BLUE}
                    shimmerColor="#1E3A8A"
                    borderRadius="12px"
                    className="w-full py-3 text-base font-semibold"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Guardando..." : "Guardar cambios"}
                </ShimmerButton>
            </div>
        </div>
    )
}
