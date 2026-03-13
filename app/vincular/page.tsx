"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { MOCK_USER_ID, SUMA_BLUE } from "@/lib/constants"

type Step = "phone" | "otp"

export default function VincularPage() {
    const router = useRouter()
    const [step, setStep] = useState<Step>("phone")
    const [phone, setPhone] = useState("")
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [verifiedUserId, setVerifiedUserId] = useState<string | null>(null)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Focus first OTP input when switching to OTP step
    useEffect(() => {
        if (step === "otp") {
            inputRefs.current[0]?.focus()
        }
    }, [step])

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // Validar teléfono (mínimo 8 dígitos)
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
                setError("Error de configuración.")
                setLoading(false)
                return
            }

            const supabase = createClient(supabaseUrl, supabaseAnonKey)

            // Search phone ignoring optional prefix (or enforcing logic, but we can LIKE match for robustness)
            // It's safer to just search 'like %cleanPhone' if we don't know the exact prefix stored, but exact matches are best if the user types exactly what's registered.
            const { data, error: dbError } = await supabase
                .from("users")
                .select("id")
                .ilike("phone", `%${cleanPhone}%`)
                .limit(1)

            if (dbError || !data || data.length === 0) {
                setError("No encontramos una cuenta con ese número. Registrate primero.")
                setLoading(false)
                return
            }

            setVerifiedUserId(data[0].id)
            setLoading(false)
            setStep("otp")
        } catch {
            setError("Error de conexión.")
            setLoading(false)
        }
    }

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
        if (pasted.length === 6) {
            setOtp(pasted.split(""))
        }
    }

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        const code = otp.join("")
        if (code.length !== 6) {
            setError("Completá los 6 dígitos del código")
            return
        }

        setLoading(true)

        // Temporarily accept ANY 6-digit code since it's dev mode, but assign real ID
        setTimeout(() => {
            setLoading(false)
            if (verifiedUserId) {
                if (typeof window !== "undefined") {
                    sessionStorage.setItem("suma_user_id", verifiedUserId)
                }
                router.push("/dashboard")
            } else {
                setError("Ocurrió un error con tu sesión. Volvé a intentarlo.")
            }
        }, 1500)
    }

    const handleSkipToTest = () => {
        // Guardar el mock user ID en sessionStorage para que el dashboard lo use
        if (typeof window !== "undefined") {
            sessionStorage.setItem("suma_user_id", MOCK_USER_ID)
        }
        router.push("/dashboard")
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
                fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                padding: "1.5rem",
            }}
        >
            {/* Card container */}
            <div
                style={{
                    width: "100%",
                    maxWidth: "420px",
                    textAlign: "center",
                }}
            >
                {/* Logo / Brand */}
                <div style={{ marginBottom: "2rem" }}>
                    <div
                        style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "16px",
                            background: SUMA_BLUE,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 1rem",
                            boxShadow: `0 8px 24px ${SUMA_BLUE}33`,
                        }}
                    >
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
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
                        Vinculá tu cuenta
                    </h1>
                    <p
                        style={{
                            fontSize: "0.95rem",
                            color: "#6B7280",
                            margin: 0,
                            lineHeight: "1.5",
                        }}
                    >
                        {step === "phone"
                            ? "Ingresá el número de WhatsApp que usás con Suma"
                            : `Te enviamos un código de 6 dígitos al ${phone}`}
                    </p>
                </div>

                {/* Phone Step */}
                {step === "phone" && (
                    <form onSubmit={handlePhoneSubmit}>
                        <div
                            style={{
                                position: "relative",
                                marginBottom: "1rem",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    border: "2px solid #E5E7EB",
                                    borderRadius: "12px",
                                    padding: "0 1rem",
                                    transition: "border-color 0.2s",
                                    background: "#F9FAFB",
                                }}
                                onFocus={(e) => {
                                    ; (e.currentTarget as HTMLDivElement).style.borderColor =
                                        SUMA_BLUE
                                        ; (e.currentTarget as HTMLDivElement).style.background =
                                            "#FFFFFF"
                                }}
                                onBlur={(e) => {
                                    ; (e.currentTarget as HTMLDivElement).style.borderColor =
                                        "#E5E7EB"
                                        ; (e.currentTarget as HTMLDivElement).style.background =
                                            "#F9FAFB"
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "1rem",
                                        color: "#6B7280",
                                        marginRight: "0.5rem",
                                        fontWeight: "500",
                                    }}
                                >
                                    🇦🇷 +54
                                </span>
                                <div
                                    style={{
                                        width: "1px",
                                        height: "24px",
                                        background: "#E5E7EB",
                                        marginRight: "0.75rem",
                                    }}
                                />
                                <input
                                    type="tel"
                                    placeholder="11 2345 6789"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    style={{
                                        flex: 1,
                                        border: "none",
                                        outline: "none",
                                        padding: "1rem 0",
                                        fontSize: "1.1rem",
                                        background: "transparent",
                                        color: "#111827",
                                        letterSpacing: "0.05em",
                                    }}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {error && (
                            <p
                                style={{
                                    color: "#EF4444",
                                    fontSize: "0.85rem",
                                    marginBottom: "1rem",
                                    textAlign: "left",
                                }}
                            >
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "0.875rem",
                                borderRadius: "12px",
                                border: "none",
                                background: SUMA_BLUE,
                                color: "white",
                                fontSize: "1rem",
                                fontWeight: "600",
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.7 : 1,
                                transition: "all 0.2s",
                                boxShadow: `0 4px 12px ${SUMA_BLUE}40`,
                            }}
                        >
                            {loading ? "Enviando..." : "Enviar código por WhatsApp"}
                        </button>
                    </form>
                )}

                {/* OTP Step */}
                {step === "otp" && (
                    <form onSubmit={handleOtpSubmit}>
                        <div
                            style={{
                                display: "flex",
                                gap: "0.5rem",
                                justifyContent: "center",
                                marginBottom: "1.5rem",
                            }}
                        >
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => {
                                        inputRefs.current[i] = el
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                    onPaste={i === 0 ? handleOtpPaste : undefined}
                                    style={{
                                        width: "52px",
                                        height: "60px",
                                        textAlign: "center",
                                        fontSize: "1.5rem",
                                        fontWeight: "700",
                                        borderRadius: "12px",
                                        border: `2px solid ${digit ? SUMA_BLUE : "#E5E7EB"}`,
                                        background: digit ? `${SUMA_BLUE}08` : "#F9FAFB",
                                        color: "#111827",
                                        outline: "none",
                                        transition: "all 0.2s",
                                        caretColor: SUMA_BLUE,
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = SUMA_BLUE
                                        e.target.style.boxShadow = `0 0 0 3px ${SUMA_BLUE}20`
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = digit ? SUMA_BLUE : "#E5E7EB"
                                        e.target.style.boxShadow = "none"
                                    }}
                                />
                            ))}
                        </div>

                        {error && (
                            <p
                                style={{
                                    color: "#EF4444",
                                    fontSize: "0.85rem",
                                    marginBottom: "1rem",
                                }}
                            >
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "0.875rem",
                                borderRadius: "12px",
                                border: "none",
                                background: SUMA_BLUE,
                                color: "white",
                                fontSize: "1rem",
                                fontWeight: "600",
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.7 : 1,
                                transition: "all 0.2s",
                                boxShadow: `0 4px 12px ${SUMA_BLUE}40`,
                            }}
                        >
                            {loading ? "Verificando..." : "Verificar código"}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setStep("phone")
                                setOtp(["", "", "", "", "", ""])
                                setError("")
                            }}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: "12px",
                                border: "none",
                                background: "transparent",
                                color: "#6B7280",
                                fontSize: "0.9rem",
                                cursor: "pointer",
                                marginTop: "0.5rem",
                                transition: "color 0.2s",
                            }}
                            onMouseEnter={(e) =>
                                ((e.target as HTMLButtonElement).style.color = "#111827")
                            }
                            onMouseLeave={(e) =>
                                ((e.target as HTMLButtonElement).style.color = "#6B7280")
                            }
                        >
                            ← Cambiar número
                        </button>
                    </form>
                )}

                {/* Divider */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "2rem 0 1.5rem",
                        gap: "1rem",
                    }}
                >
                    <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
                    <span
                        style={{
                            fontSize: "0.8rem",
                            color: "#9CA3AF",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            fontWeight: "500",
                        }}
                    >
                        Modo desarrollo
                    </span>
                    <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
                </div>

                {/* Skip to test button */}
                <button
                    onClick={handleSkipToTest}
                    style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "12px",
                        border: "2px dashed #D1D5DB",
                        background: "#FAFAFA",
                        color: "#6B7280",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                    }}
                    onMouseEnter={(e) => {
                        const btn = e.currentTarget
                        btn.style.borderColor = SUMA_BLUE
                        btn.style.color = SUMA_BLUE
                        btn.style.background = `${SUMA_BLUE}08`
                    }}
                    onMouseLeave={(e) => {
                        const btn = e.currentTarget
                        btn.style.borderColor = "#D1D5DB"
                        btn.style.color = "#6B7280"
                        btn.style.background = "#FAFAFA"
                    }}
                >
                    <span>🧪</span>
                    Saltar para Test → Dashboard
                </button>

                {/* Back to home */}
                <p
                    style={{
                        marginTop: "1.5rem",
                        fontSize: "0.85rem",
                        color: "#9CA3AF",
                    }}
                >
                    <a
                        href="/"
                        style={{
                            color: "#6B7280",
                            textDecoration: "none",
                            transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                            ((e.target as HTMLAnchorElement).style.color = SUMA_BLUE)
                        }
                        onMouseLeave={(e) =>
                            ((e.target as HTMLAnchorElement).style.color = "#6B7280")
                        }
                    >
                        ← Volver al inicio
                    </a>
                </p>
            </div>
        </div>
    )
}
