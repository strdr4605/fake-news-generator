import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type LayoutProps = {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b-3 border-black bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black uppercase tracking-tight hover:underline">
            Fake News
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}