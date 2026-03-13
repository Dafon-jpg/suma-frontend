"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@supabase/supabase-js"
import { MOCK_USER_ID, SUMA_BLUE } from "@/lib/constants"
import { ShimmerButton } from "@/components/ui/shimmer-button"

// ——————————————————————————————————————————————
// Prefijos telefónicos LATAM + USA
// ——————————————————————————————————————————————
const COUNTRY_PREFIXES = [
    { code: "+54", flag: "🇦🇷", country: "Argentina" },
    { code: "+55", flag: "🇧🇷", country: "Brasil" },
    { code: "+56", flag: "🇨🇱", country: "Chile" },
    { code: "+57", flag: "🇨🇴", country: "Colombia" },
    { code: "+52", flag: "🇲🇽", country: "México" },
    { code: "+51", flag: "🇵🇪", country: "Perú" },
    { code: "+598", flag: "🇺🇾", country: "Uruguay" },
    { code: "+595", flag: "🇵🇾", country: "Paraguay" },
    { code: "+591", flag: "🇧🇴", country: "Bolivia" },
    { code: "+593", flag: "🇪🇨", country: "Ecuador" },
    { code: "+58", flag: "🇻🇪", country: "Venezuela" },
    { code: "+506", flag: "🇨🇷", country: "Costa Rica" },
    { code: "+507", flag: "🇵🇦", country: "Panamá" },
    { code: "+502", flag: "🇬🇹", country: "Guatemala" },
    { code: "+503", flag: "🇸🇻", country: "El Salvador" },
    { code: "+504", flag: "🇭🇳", country: "Honduras" },
    { code: "+505", flag: "🇳🇮", country: "Nicaragua" },
    { code: "+509", flag: "🇭🇹", country: "Haití" },
    { code: "+1", flag: "🇺🇸", country: "Estados Unidos" },
]

type Step = 1 | 2 | 3

export default function RegistroPage() {
    const router = useRouter()
    const [step, setStep] = useState<Step>(1)

    // Form data
    const [nombre, setNombre] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [prefix, setPrefix] = useState(COUNTRY_PREFIXES[0])
    const [showPrefixes, setShowPrefixes] = useState(false)

    // State
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [userId, setUserId] = useState<string | null>(null)

    // ——————————————————————————————————————————————
    // STEP 1 → Supabase INSERT
    // ——————————————————————————————————————————————
    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!nombre.trim() || nombre.trim().length < 2) {
            setError("Ingresá tu nombre completo")
            return
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError("Ingresá un email válido")
            return
        }
        const cleanPhone = phone.replace(/\D/g, "")
        if (cleanPhone.length < 8) {
            setError("Ingresá un número de teléfono válido")
            return
        }

        setLoading(true)

        try {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

            if (!supabaseUrl || !supabaseAnonKey) {
                setError("Error de configuración: faltan las llaves de Supabase")
                setLoading(false)
                return
            }

            const supabase = createClient(supabaseUrl, supabaseAnonKey)
            const fullPhone = `${prefix.code}${cleanPhone}`

            const { data, error: dbError } = await supabase
                .from("users")
                .insert({ name: nombre.trim(), phone: fullPhone, email: email.trim() })
                .select()
                .single()

            if (dbError) {
                if (dbError.code === "23505") {
                    setError("Ese número ya está registrado. ¿Querés iniciar sesión?")
                } else {
                    setError(`Error: ${dbError.message}`)
                }
                setLoading(false)
                return
            }

            if (data?.id) {
                setUserId(data.id)
                if (typeof window !== "undefined") {
                    sessionStorage.setItem("suma_user_id", data.id)
                }
            }

            setStep(2)
        } catch {
            setError("Error de conexión. Intentá nuevamente.")
        } finally {
            setLoading(false)
        }
    }

    // ——————————————————————————————————————————————
    // STEP 2 → Mock Payment → Success
    // ——————————————————————————————————————————————
    const handleMockPayment = () => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            setStep(3)
        }, 1500)
    }

    // ——————————————————————————————————————————————
    // Skip to test
    // ——————————————————————————————————————————————
    const handleSkipToTest = () => {
        if (typeof window !== "undefined") {
            sessionStorage.setItem("suma_user_id", MOCK_USER_ID)
        }
        router.push("/dashboard")
    }

    const openWhatsApp = () => {
        window.open("https://wa.me/5491112345678?text=Hola", "_blank")
    }

    // Shared styles
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

    // =============================================
    // STEP 3 — SUCCESS
    // =============================================
    if (step === 3) {
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
                <div style={{ width: "100%", maxWidth: "440px", textAlign: "center" }}>
                    {/* Mascot */}
                    <div
                        style={{
                            width: "120px",
                            height: "120px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            margin: "0 auto 1rem",
                            border: `4px solid ${SUMA_BLUE}`,
                            boxShadow: `0 8px 32px ${SUMA_BLUE}30`,
                        }}
                    >
                        <Image
                            src="/suma-avatar.png"
                            alt="Suma"
                            width={120}
                            height={120}
                            style={{ objectFit: "cover" }}
                        />
                    </div>

                    {/* Check icon */}
                    <div
                        style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            background: `${SUMA_BLUE}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 1.5rem",
                        }}
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={SUMA_BLUE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>

                    <h1
                        style={{
                            fontSize: "1.75rem",
                            fontWeight: "700",
                            color: "#111827",
                            margin: "0 0 0.5rem",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        ¡Todo listo, {nombre.split(" ")[0]}!
                    </h1>

                    <p
                        style={{
                            fontSize: "1rem",
                            color: "#6B7280",
                            margin: "0 0 2rem",
                            lineHeight: "1.6",
                        }}
                    >
                        Tu asistente financiero te está esperando.
                        <br />
                        Mandá un{" "}
                        <strong style={{ color: "#111827" }}>&ldquo;Hola&rdquo;</strong> a
                        nuestro WhatsApp para activar tu bot.
                    </p>

                    {/* WhatsApp CTA — Giant */}
                    <ShimmerButton
                        background="#25D366"
                        shimmerColor="#128C7E"
                        borderRadius="16px"
                        className="w-full py-4 text-lg font-bold"
                        onClick={openWhatsApp}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style={{ marginRight: "0.5rem" }}>
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Abrir WhatsApp de Suma
                    </ShimmerButton>

                    {/* Secondary: go to dashboard */}
                    <button
                        onClick={() => router.push("/dashboard")}
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "12px",
                            border: `2px solid ${SUMA_BLUE}`,
                            background: "transparent",
                            color: SUMA_BLUE,
                            fontSize: "0.95rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            marginTop: "0.75rem",
                            transition: "all 0.2s",
                        }}
                    >
                        Ir al Dashboard →
                    </button>

                    <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "#9CA3AF" }}>
                        <a href="/" style={{ color: "#6B7280", textDecoration: "none" }}>
                            ← Volver al inicio
                        </a>
                    </p>
                </div>
            </div>
        )
    }

    // =============================================
    // STEP 2 — MOCK PAYMENT
    // =============================================
    if (step === 2) {
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
                <div style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>
                    {/* Mascot */}
                    <div
                        style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            margin: "0 auto 1.5rem",
                            border: `3px solid ${SUMA_BLUE}20`,
                        }}
                    >
                        <Image
                            src="/suma-avatar.png"
                            alt="Suma"
                            width={80}
                            height={80}
                            style={{ objectFit: "cover" }}
                        />
                    </div>

                    {/* Step indicator */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "0.5rem",
                            marginBottom: "1.5rem",
                        }}
                    >
                        <div style={{ width: "32px", height: "4px", borderRadius: "2px", background: SUMA_BLUE }} />
                        <div style={{ width: "32px", height: "4px", borderRadius: "2px", background: SUMA_BLUE }} />
                        <div style={{ width: "32px", height: "4px", borderRadius: "2px", background: "#E5E7EB" }} />
                    </div>

                    <h1
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: "700",
                            color: "#111827",
                            margin: "0 0 0.5rem",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Suscribite a Suma Pro
                    </h1>

                    <p
                        style={{
                            fontSize: "0.9rem",
                            color: "#6B7280",
                            margin: "0 0 2rem",
                            lineHeight: "1.5",
                        }}
                    >
                        Accedé a reportes avanzados, exportación a Excel y soporte prioritario
                    </p>

                    {/* Pricing card */}
                    <div
                        style={{
                            border: "2px solid #E5E7EB",
                            borderRadius: "16px",
                            padding: "1.5rem",
                            marginBottom: "1.5rem",
                            textAlign: "left",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <div>
                                <p style={{ fontWeight: "700", fontSize: "1.1rem", color: "#111827", margin: 0 }}>
                                    Suma Pro
                                </p>
                                <p style={{ fontSize: "0.8rem", color: "#6B7280", margin: "0.25rem 0 0" }}>
                                    Plan mensual
                                </p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <p style={{ fontWeight: "800", fontSize: "1.6rem", color: "#111827", margin: 0 }}>
                                    $9.000
                                </p>
                                <p style={{ fontSize: "0.75rem", color: "#9CA3AF", margin: 0 }}>/mes</p>
                            </div>
                        </div>

                        <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "1rem" }}>
                            {["Reportes avanzados a Excel/CSV", "Auto-categorización por IA", "Soporte prioritario 24/7"].map((feat, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SUMA_BLUE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    <span style={{ fontSize: "0.85rem", color: "#374151" }}>{feat}</span>
                                </div>
                            ))}
                        </div>

                        {/* MercadoPago badge */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem",
                                marginTop: "1rem",
                                padding: "0.5rem",
                                borderRadius: "8px",
                                background: "#F9FAFB",
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                <line x1="1" y1="10" x2="23" y2="10" />
                            </svg>
                            <span style={{ fontSize: "0.75rem", color: "#9CA3AF", fontWeight: "500" }}>
                                Procesado por MercadoPago
                            </span>
                        </div>
                    </div>

                    {/* Confirm button */}
                    <ShimmerButton
                        background="rgba(0, 0, 0, 1)"
                        shimmerColor="#1E3A8A"
                        borderRadius="12px"
                        className="w-full py-3 text-base font-semibold"
                        onClick={handleMockPayment}
                        disabled={loading}
                    >
                        {loading ? (
                            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                                </svg>
                                Procesando...
                            </span>
                        ) : (
                            "Confirmar Suscripción"
                        )}
                    </ShimmerButton>

                    {/* Skip */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            margin: "1.25rem 0 0.75rem",
                            gap: "1rem",
                        }}
                    >
                        <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
                        <span style={{ fontSize: "0.75rem", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "500" }}>
                            Modo desarrollo
                        </span>
                        <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
                    </div>

                    <button
                        onClick={handleSkipToTest}
                        style={{
                            width: "100%",
                            padding: "0.6rem",
                            borderRadius: "10px",
                            border: "2px dashed #D1D5DB",
                            background: "#FAFAFA",
                            color: "#6B7280",
                            fontSize: "0.85rem",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.2s",
                        }}
                    >
                        🧪 Saltar para Test → Dashboard
                    </button>

                    {/* Back buttons */}
                    <button
                        onClick={() => setStep(1)}
                        style={{
                            width: "100%",
                            padding: "0.6rem",
                            borderRadius: "10px",
                            border: "none",
                            background: "transparent",
                            color: "#6B7280",
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            marginTop: "0.75rem",
                            transition: "color 0.2s",
                        }}
                    >
                        ← Volver al formulario
                    </button>
                    <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#9CA3AF" }}>
                        <a href="/" style={{ color: "#6B7280", textDecoration: "none" }}>
                            ← Volver al inicio
                        </a>
                    </p>
                </div>
            </div>
        )
    }

    // =============================================
    // STEP 1 — REGISTRATION FORM
    // =============================================
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
            <div style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>
                {/* Mascot */}
                <div
                    style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        margin: "0 auto 1rem",
                        border: `3px solid ${SUMA_BLUE}20`,
                    }}
                >
                    <Image
                        src="/suma-avatar.png"
                        alt="Suma"
                        width={80}
                        height={80}
                        style={{ objectFit: "cover" }}
                    />
                </div>

                {/* Step indicator */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "0.5rem",
                        marginBottom: "1.5rem",
                    }}
                >
                    <div style={{ width: "32px", height: "4px", borderRadius: "2px", background: SUMA_BLUE }} />
                    <div style={{ width: "32px", height: "4px", borderRadius: "2px", background: "#E5E7EB" }} />
                    <div style={{ width: "32px", height: "4px", borderRadius: "2px", background: "#E5E7EB" }} />
                </div>

                <h1
                    style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: "#111827",
                        margin: "0 0 0.25rem",
                        letterSpacing: "-0.02em",
                    }}
                >
                    Creá tu cuenta
                </h1>
                <p style={{ fontSize: "0.9rem", color: "#6B7280", margin: "0 0 1.5rem" }}>
                    Registrate para vincular tu WhatsApp con Suma
                </p>

                <form onSubmit={handleStep1Submit}>
                    {/* Nombre */}
                    <div style={{ marginBottom: "0.75rem", textAlign: "left" }}>
                        <label style={labelStyle}>Nombre completo</label>
                        <input
                            type="text"
                            placeholder="Ej: María García"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            style={inputStyle}
                            onFocus={(e) => { e.target.style.borderColor = SUMA_BLUE; e.target.style.background = "#FFF" }}
                            onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.background = "#F9FAFB" }}
                            autoFocus
                        />
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: "0.75rem", textAlign: "left" }}>
                        <label style={labelStyle}>Email</label>
                        <input
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={inputStyle}
                            onFocus={(e) => { e.target.style.borderColor = SUMA_BLUE; e.target.style.background = "#FFF" }}
                            onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.background = "#F9FAFB" }}
                        />
                    </div>

                    {/* WhatsApp with prefix */}
                    <div style={{ marginBottom: "1rem", textAlign: "left" }}>
                        <label style={labelStyle}>Número de WhatsApp</label>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "stretch" }}>
                            {/* Prefix dropdown */}
                            <div style={{ position: "relative" }}>
                                <button
                                    type="button"
                                    onClick={() => setShowPrefixes(!showPrefixes)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.25rem",
                                        padding: "0.75rem",
                                        borderRadius: "12px",
                                        border: "2px solid #E5E7EB",
                                        background: "#F9FAFB",
                                        fontSize: "0.95rem",
                                        cursor: "pointer",
                                        height: "100%",
                                        whiteSpace: "nowrap",
                                        transition: "border-color 0.2s",
                                        color: "#111827",
                                    }}
                                >
                                    <span>{prefix.flag}</span>
                                    <span style={{ fontWeight: "500" }}>{prefix.code}</span>
                                    <svg
                                        width="12" height="12" viewBox="0 0 24 24"
                                        fill="none" stroke="#6B7280" strokeWidth="2.5"
                                        style={{ transform: showPrefixes ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                                    </svg>
                                </button>

                                {showPrefixes && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "calc(100% + 4px)",
                                            left: 0,
                                            width: "240px",
                                            maxHeight: "280px",
                                            overflowY: "auto",
                                            background: "white",
                                            borderRadius: "12px",
                                            border: "1px solid #E5E7EB",
                                            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                                            zIndex: 50,
                                        }}
                                    >
                                        {COUNTRY_PREFIXES.map((p) => (
                                            <button
                                                key={p.code + p.country}
                                                type="button"
                                                onClick={() => { setPrefix(p); setShowPrefixes(false) }}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.75rem",
                                                    width: "100%",
                                                    padding: "0.6rem 1rem",
                                                    border: "none",
                                                    background: prefix.code === p.code ? `${SUMA_BLUE}10` : "transparent",
                                                    cursor: "pointer",
                                                    fontSize: "0.9rem",
                                                    color: "#111827",
                                                    textAlign: "left",
                                                    transition: "background 0.15s",
                                                }}
                                            >
                                                <span style={{ fontSize: "1.2rem" }}>{p.flag}</span>
                                                <span style={{ flex: 1 }}>{p.country}</span>
                                                <span style={{ color: "#6B7280", fontWeight: "500", fontSize: "0.85rem" }}>{p.code}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <input
                                type="tel"
                                placeholder="11 2345 6789"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                style={{
                                    ...inputStyle,
                                    flex: 1,
                                    minWidth: 0,
                                    letterSpacing: "0.05em",
                                }}
                                onFocus={(e) => { e.target.style.borderColor = SUMA_BLUE; e.target.style.background = "#FFF" }}
                                onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.background = "#F9FAFB" }}
                            />
                        </div>
                    </div>

                    {error && (
                        <p style={{ color: "#EF4444", fontSize: "0.85rem", marginBottom: "1rem", textAlign: "left" }}>
                            {error}
                        </p>
                    )}

                    {/* Submit */}
                    <ShimmerButton
                        background={SUMA_BLUE}
                        shimmerColor="#1E3A8A"
                        borderRadius="12px"
                        className="w-full py-3 text-base font-semibold"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Creando cuenta..." : "Siguiente →"}
                    </ShimmerButton>
                </form>

                {/* Already registered */}
                <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#6B7280" }}>
                    ¿Ya tenés cuenta?{" "}
                    <a href="/vincular" style={{ color: SUMA_BLUE, textDecoration: "none", fontWeight: "600" }}>
                        Iniciar sesión
                    </a>
                </p>

                {/* Dev mode bypass */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "1.25rem 0 0.75rem",
                        gap: "1rem",
                    }}
                >
                    <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
                    <span style={{ fontSize: "0.75rem", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "500" }}>
                        Modo desarrollo
                    </span>
                    <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
                </div>

                <button
                    onClick={handleSkipToTest}
                    style={{
                        width: "100%",
                        padding: "0.6rem",
                        borderRadius: "10px",
                        border: "2px dashed #D1D5DB",
                        background: "#FAFAFA",
                        color: "#6B7280",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s",
                    }}
                >
                    🧪 Saltar para Test → Dashboard
                </button>

                <p style={{ marginTop: "1.25rem", fontSize: "0.85rem", color: "#9CA3AF" }}>
                    <a href="/" style={{ color: "#6B7280", textDecoration: "none" }}>
                        ← Volver al inicio
                    </a>
                </p>
            </div>
        </div>
    )
}
