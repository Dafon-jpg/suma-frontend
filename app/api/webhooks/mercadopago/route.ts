import { db } from "@/lib/db"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // Mercado Pago sends different notification formats
        // For preapproval: { type: "subscription_preapproval", data: { id: "..." } }
        // For IPN: { topic: "preapproval", id: "..." }
        const type = body.type || body.topic
        const preapprovalId = body.data?.id || body.id

        if (!preapprovalId) {
            return new Response("Missing preapproval ID", { status: 400 })
        }

        // Only process preapproval events
        if (type !== "subscription_preapproval" && type !== "preapproval") {
            // Acknowledge other events silently
            return new Response(null, { status: 200 })
        }

        const accessToken = process.env.MP_ACCESS_TOKEN
        if (!accessToken) {
            return new Response("MP not configured", { status: 500 })
        }

        // Fetch the preapproval details from MP API
        const mpResponse = await fetch(
            `https://api.mercadopago.com/preapproval/${preapprovalId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        )

        if (!mpResponse.ok) {
            console.error("[MP Webhook] Error fetching preapproval:", await mpResponse.text())
            return new Response("Error fetching preapproval", { status: 500 })
        }

        const preapproval = await mpResponse.json()
        const userId = preapproval.external_reference

        if (!userId) {
            console.error("[MP Webhook] No external_reference (userId) in preapproval")
            return new Response("No user reference", { status: 400 })
        }

        // Map MP status to our subscription status
        let subscriptionStatus: string
        switch (preapproval.status) {
            case "authorized":
                subscriptionStatus = "active"
                break
            case "pending":
                subscriptionStatus = "pending"
                break
            case "paused":
            case "cancelled":
                subscriptionStatus = "cancelled"
                break
            default:
                subscriptionStatus = "none"
        }

        // Update user in database
        await db.user.update({
            where: { id: userId },
            data: {
                mpSubscriptionId: preapproval.id?.toString(),
                mpCustomerId: preapproval.payer_id?.toString() || null,
                subscriptionStatus,
            },
        })

        console.log(
            `[MP Webhook] User ${userId} subscription updated to: ${subscriptionStatus}`
        )

        return new Response(null, { status: 200 })
    } catch (error) {
        console.error("[MP Webhook Error]", error)
        return new Response("Webhook error", { status: 500 })
    }
}
