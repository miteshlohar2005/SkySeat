import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import {
  Home,
  Results,
  Compare,
  Seats,
  Passengers,
  Payment,
  Confirmation,
  Dashboard,
  Empty,
} from './pages.jsx'

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const { pathname } = useLocation()
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const nl = ({ isActive }) =>
    'rounded-lg px-3 py-1.5 text-sm transition-colors ' +
    (isActive ? 'bg-surface-2 text-sky-brand font-semibold' : 'text-muted hover:text-ink')

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
            <span>✈ Sky<span className="text-sky-brand">Seat</span></span>
            <span className="hidden rounded-full border border-line bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-muted sm:inline-block">
              Seat Selection & Pax Management
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <NavLink to="/" end className={nl}>Search</NavLink>
            <NavLink to="/dashboard" className={nl}>My trips</NavLink>
            <button
              aria-label="Toggle theme"
              className="ml-2 rounded-lg border border-line bg-surface px-2.5 py-1 text-sm text-ink transition hover:bg-surface-2"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-28">
        <div key={pathname} className="page">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/seats" element={<Seats />} />
            <Route path="/passengers" element={<Passengers />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/confirmation/:ref" element={<Confirmation />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="*"
              element={<Empty text="This page does not exist." to="/" label="Back to search" />}
            />
          </Routes>
        </div>
      </main>

      <footer className="border-t border-line bg-surface/50 py-6 text-center text-xs text-muted">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <b>SkySeat</b> – Flight Seat Selection & Passenger Management Technical Assessment.
          </div>
          <div>
            Originally based on open-source AeroLink by Muhammad Faiz Alam.
          </div>
        </div>
      </footer>
    </div>
  )
}
