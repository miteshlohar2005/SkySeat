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
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const nl = ({ isActive }) =>
    'sky-nav-link rounded-lg px-3 py-1.5 text-sm transition-colors ' +
    (isActive ? 'is-active font-semibold' : 'text-muted hover:text-ink')

  return (
    <div className="sky-app flex min-h-screen flex-col">
      <header className="sky-nav sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="sky-brand flex items-center gap-3 font-display text-xl font-bold tracking-tight">
            <span className="brand-mark">✦</span>
            <span>SKY<span>SEAT</span></span>
            <span className="hidden brand-tag sm:inline-block">PRIVATE AVIATION / 01</span>
          </Link>
          <button
            type="button"
            className="sky-menu-toggle rounded-lg border border-line px-3 py-1.5 text-sm text-muted"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            Menu
          </button>
          <div id="primary-navigation" className={`sky-navigation flex items-center gap-1.5 ${menuOpen ? 'is-open' : ''}`}>
            <NavLink to="/" end className={nl} onClick={() => setMenuOpen(false)}>Search</NavLink>
            <NavLink to="/dashboard" className={nl} onClick={() => setMenuOpen(false)}>My trips</NavLink>
          </div>
        </nav>
      </header>

      <main data-route={pathname} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-28">
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

      <footer className="border-t border-line bg-surface/50 py-8 text-center text-xs text-muted">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:text-left">
          <div><b className="text-ink">SKYSEAT</b><span className="ml-3">Travel, considered.</span></div>
          <div>Originally based on open-source AeroLink by Muhammad Faiz Alam.</div>
        </div>
      </footer>
    </div>
  )
}
