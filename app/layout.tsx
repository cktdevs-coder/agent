import './globals.css'
export const metadata = { title: 'AI Remote Command Center', description: 'Control everything from anywhere' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen font-sans">{children}</body>
    </html>
  )
}
