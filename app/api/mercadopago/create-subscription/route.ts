import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { absoluteUrl } from "@/lib/utils"

const billingUrl = absoluteUrl("/dashboard/billing")

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || !session?.user.email) {
            return new Response(null, { status: 403 })
        }

        const accessToken = process.env.MP_ACCESS_TOKEN
        if (!accessToken) {
            return new Response(
                JSON.stringify({ error: "Mercado Pago no está configurado" }),
                { status: 500 }
            )
        }

        // Create a Preapproval (recurring subscription) via MP API
        const response = await fetch(
            "https://api.mercadopago.com/preapproval",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    reason: "Suma Pro — Suscripción Mensual",
                    auto_recurring: {
                        frequency: 1,
                        frequency_type: "months",
                        transaction_amount: 9000,
                        currency_id: "ARS",
                    },
                    back_url: billingUrl,
                    external_reference: session.user.id,
                    payer_email: session.user.email,
                    status: "pending",
                }),
            }
        )

        if (!response.ok) {
            const errorData = await response.text()
            console.error("[MP Preapproval Error]", errorData)
            return new Response(
                JSON.stringify({ error: "Error al crear la suscripción en Mercado Pago" }),
                { status: 500 }
            )
        }

        const data = await response.json()

        return new Response(
            JSON.stringify({ url: data.init_point, id: data.id }),
            { status: 200 }
        )
    } catch (error) {
        console.error("[MP Create Subscription Error]", error)
        return new Response(null, { status: 500 })
    }
}
