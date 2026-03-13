"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CheckIcon, ArrowRightIcon } from "@radix-ui/react-icons"
import NumberFlow from "@number-flow/react"

export type PlanLevel = "starter" | "pro" | "all" | string

export interface PricingFeature {
    name: string
    included: PlanLevel | null
}

export interface PricingPlan {
    name: string
    level: PlanLevel
    price: {
        monthly: number
        yearly: number
    }
    popular?: boolean
}

export interface PricingTableProps
    extends React.HTMLAttributes<HTMLDivElement> {
    features: PricingFeature[]
    plans: PricingPlan[]
    onPlanSelect?: (plan: PlanLevel) => void
    defaultPlan?: PlanLevel
    defaultInterval?: "monthly" | "yearly"
    containerClassName?: string
    buttonClassName?: string
}

export function PricingTable({
    features,
    plans,
    onPlanSelect,
    defaultPlan = "pro",
    defaultInterval = "monthly",
    className,
    containerClassName,
    buttonClassName,
    ...props
}: PricingTableProps) {
    const [isYearly, setIsYearly] = React.useState(defaultInterval === "yearly")
    const [selectedPlan, setSelectedPlan] = React.useState<PlanLevel>(defaultPlan)

    const handlePlanSelect = (plan: PlanLevel) => {
        setSelectedPlan(plan)
        onPlanSelect?.(plan)
    }

    return (
        <section
            className={cn(
                "bg-background text-foreground",
                "pt-4 pb-8 px-4",
                "fade-bottom overflow-hidden",
            )}
        >
            <div
                className={cn("w-full max-w-3xl mx-auto px-4", containerClassName)}
                {...props}
            >
                <div className="flex justify-end mb-6">
                    <div className="inline-flex items-center gap-2 text-xs sm:text-sm">
                        <button
                            type="button"
                            onClick={() => setIsYearly(false)}
                            className={cn(
                                "px-3 py-1 rounded-md transition-colors",
                                !isYearly ? "bg-zinc-100 dark:bg-zinc-800" : "text-zinc-500",
                            )}
                        >
                            Mensual
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsYearly(true)}
                            className={cn(
                                "px-3 py-1 rounded-md transition-colors",
                                isYearly ? "bg-zinc-100 dark:bg-zinc-800" : "text-zinc-500",
                            )}
                        >
                            Anual
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {plans.map((plan) => (
                        <button
                            key={plan.name}
                            type="button"
                            onClick={() => handlePlanSelect(plan.level)}
                            className={cn(
                                "flex-1 p-4 rounded-xl text-left transition-all",
                                "border border-zinc-200 dark:border-zinc-800",
                                selectedPlan === plan.level &&
                                "ring-2 ring-[#2A87CF]",
                            )}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{plan.name}</span>
                                {plan.popular && (
                                    <span className="text-xs bg-[#2A87CF]/10 text-[#2A87CF] px-2 py-0.5 rounded-full">
                                        Popular
                                    </span>
                                )}
                            </div>
                            <div className="flex items-baseline gap-1">
                                <NumberFlow
                                    locales="es-AR"
                                    format={{
                                        style: "currency",
                                        currency: "ARS",
                                        currencyDisplay: "code",
                                        trailingZeroDisplay: "stripIfInteger",
                                    }}
                                    value={isYearly ? plan.price.yearly : plan.price.monthly}
                                    className="text-2xl font-bold"
                                />
                                <span className="text-sm font-normal text-zinc-500">
                                    /{isYearly ? "año" : "mes"}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <div className="min-w-[640px] divide-y divide-zinc-200 dark:divide-zinc-800">
                            <div className="flex items-center p-4 bg-zinc-50 dark:bg-zinc-900">
                                <div className="flex-1 text-sm font-medium">Características</div>
                                <div className="flex items-center gap-8 text-sm">
                                    {plans.map((plan) => (
                                        <div
                                            key={plan.level}
                                            className="w-16 text-center font-medium"
                                        >
                                            {plan.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {features.map((feature) => (
                                <div
                                    key={feature.name}
                                    className={cn(
                                        "flex items-center p-4 transition-colors",
                                        feature.included === selectedPlan &&
                                        "bg-[#2A87CF]/5",
                                    )}
                                >
                                    <div className="flex-1 text-sm">{feature.name}</div>
                                    <div className="flex items-center gap-8 text-sm">
                                        {plans.map((plan) => (
                                            <div
                                                key={plan.level}
                                                className={cn(
                                                    "w-16 flex justify-center",
                                                    plan.level === selectedPlan && "font-medium",
                                                )}
                                            >
                                                {shouldShowCheck(feature.included, plan.level) ? (
                                                    <CheckIcon className="w-5 h-5 text-[#2A87CF]" />
                                                ) : (
                                                    <span className="text-zinc-300 dark:text-zinc-700">
                                                        -
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Button
                        className={cn(
                            "w-full sm:w-auto bg-[#2A87CF] hover:bg-[#2A87CF]/90 px-8 py-2 text-white rounded-xl",
                            buttonClassName,
                        )}
                        onClick={() => {
                            window.location.href = '/login';
                        }}
                    >
                        Comenzá ahora
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </section>
    )
}

function shouldShowCheck(
    included: PricingFeature["included"],
    level: string,
): boolean {
    if (included === "all") return true
    if (included === "pro" && (level === "pro" || level === "all")) return true
    if (
        included === "starter" &&
        (level === "starter" || level === "pro" || level === "all")
    )
        return true
    return false
}
