import { createClient } from "@supabase/supabase-js"

// Forzar renderizado dinámico — sin cache
export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata = {
    title: "Test Conexión Supabase",
}

export default async function TestConexionPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Guard: si faltan las llaves, mostrar mensaje claro
    if (!supabaseUrl || !supabaseAnonKey) {
        return (
            <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
                <h1 style={{ color: "#e11d48", fontSize: "1.5rem" }}>
                    ⚠️ Error de Configuración
                </h1>
                <p style={{ marginTop: "1rem", fontSize: "1.1rem" }}>
                    Por favor, cargá tus llaves en{" "}
                    <code
                        style={{
                            background: "#f1f5f9",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                        }}
                    >
                        .env.local
                    </code>
                </p>
                <pre
                    style={{
                        marginTop: "1rem",
                        background: "#1e293b",
                        color: "#e2e8f0",
                        padding: "1rem",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                    }}
                >
                    {`NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key`}
                </pre>
            </div>
        )
    }

    // Crear cliente inline para la prueba (Server Component)
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Intentar traer las categorías
    const { data: categories, error } = await supabase
        .from("categories")
        .select("*")

    return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                🔌 Test de Conexión — Supabase
            </h1>

            {error ? (
                <div style={{ marginTop: "1rem" }}>
                    <p style={{ color: "#e11d48", fontWeight: "600" }}>
                        ❌ Error al conectar:
                    </p>
                    <pre
                        style={{
                            marginTop: "0.5rem",
                            background: "#fef2f2",
                            color: "#991b1b",
                            padding: "1rem",
                            borderRadius: "8px",
                            fontSize: "0.85rem",
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {JSON.stringify(error, null, 2)}
                    </pre>
                </div>
            ) : (
                <div style={{ marginTop: "1rem" }}>
                    <p style={{ color: "#16a34a", fontWeight: "600", fontSize: "1.1rem" }}>
                        ✅ Conexión exitosa — {categories?.length ?? 0} categorías
                        encontradas
                    </p>

                    {categories && categories.length > 0 ? (
                        <table
                            style={{
                                marginTop: "1rem",
                                borderCollapse: "collapse",
                                width: "100%",
                                maxWidth: "600px",
                            }}
                        >
                            <thead>
                                <tr>
                                    {Object.keys(categories[0]).map((key) => (
                                        <th
                                            key={key}
                                            style={{
                                                textAlign: "left",
                                                padding: "0.5rem 1rem",
                                                borderBottom: "2px solid #e2e8f0",
                                                fontSize: "0.85rem",
                                                color: "#64748b",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat, i) => (
                                    <tr key={i}>
                                        {Object.values(cat).map((val, j) => (
                                            <td
                                                key={j}
                                                style={{
                                                    padding: "0.5rem 1rem",
                                                    borderBottom: "1px solid #f1f5f9",
                                                    fontSize: "0.9rem",
                                                }}
                                            >
                                                {String(val)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ marginTop: "0.5rem", color: "#94a3b8" }}>
                            La tabla categories existe pero está vacía.
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
