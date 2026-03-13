import { Inter as FontSans } from "next/font/google"
import localFont from "next/font/local"

import "@/styles/globals.css"
import { siteConfig } from "@/config/site"
import { absoluteUrl, cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@/components/analytics"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

// Font files can be colocated inside of `pages`
const fontHeading = localFont({
  src: "../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
})

interface RootLayoutProps {
  children: React.ReactNode
}

export const metadata = {
  title: {
    default: "Suma - Tu aliado financiero",
    template: `%s | Suma`,
  },
  description:
    "Organizá tus finanzas de forma inteligente con Suma Digital. Registrá gastos por WhatsApp con IA, visualizá tus reportes y tomá mejores decisiones.",
  keywords: [
    "finanzas personales",
    "gastos",
    "ahorro",
    "WhatsApp",
    "IA",
    "Argentina",
    "Suma Digital",
  ],
  authors: [
    {
      name: "Suma Digital",
      url: "https://sumadigital.com",
    },
  ],
  creator: "Suma Digital",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FEFEFE" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteConfig.url,
    title: "Suma - Tu aliado financiero",
    description:
      "Organizá tus finanzas de forma inteligente con Suma Digital.",
    siteName: "Suma",
  },
  twitter: {
    card: "summary_large_image",
    title: "Suma - Tu aliado financiero",
    description:
      "Organizá tus finanzas de forma inteligente con Suma Digital.",
    images: [`${siteConfig.url}/og.jpg`],
    creator: "@sumadigital",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Analytics />
          <Toaster />
          <TailwindIndicator />
        </ThemeProvider>
      </body>
    </html>
  )
}
