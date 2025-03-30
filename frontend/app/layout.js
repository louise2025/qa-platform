import "./globals.css"
import { Providers } from "./providers"
import Navbar from "@/components/Navbar"

export const metadata = {
  title: "Programming Q&A Platform",
  description: "A platform for programming questions and answers",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}

