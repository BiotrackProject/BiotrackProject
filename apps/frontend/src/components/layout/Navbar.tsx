import { useEffect, useRef, useState, useMemo } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, FileWarning, Home, HelpCircle, Newspaper, LifeBuoy, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import imagotipoNegativo from '../../assets/images/imagotipo negativo.svg'

const SUGGESTION_ICONS: Record<string, typeof Home> = {
  home: Home,
  report: FileWarning,
  faq: HelpCircle,
  news: Newspaper,
  help: LifeBuoy,
  register: UserPlus,
}

const SUGGESTION_ROUTES: Record<string, string> = {
  home: '/',
  report: '/reporte/nuevo',
  faq: '/#faq',
  news: '/#noticias',
  help: '/#ayuda',
  register: '/registro',
}

const SUGGESTION_KEYS = Object.keys(SUGGESTION_ROUTES)

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const searchRef = useRef<HTMLFormElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const navItems = [
    { to: '/', label: t('nav.home') },
    { to: '/reporte/nuevo', label: t('nav.report') },
    { to: '/reportes', label: t('nav.consult') },
  ]

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SUGGESTION_KEYS.map(key => ({ key, label: t(`nav.suggestions.${key}`) }))
    return SUGGESTION_KEYS
      .map(key => ({ key, label: t(`nav.suggestions.${key}`) }))
      .filter(s => s.label.toLowerCase().includes(q))
  }, [query, t])

  function goTo(key: string) {
    const route = SUGGESTION_ROUTES[key]
    if (route.startsWith('/#')) {
      navigate('/')
      setTimeout(() => {
        const id = route.slice(2)
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      navigate(route)
    }
    setIsSearchOpen(false)
    setQuery('')
    setActiveIdx(-1)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (activeIdx >= 0 && activeIdx < suggestions.length) {
      goTo(suggestions[activeIdx].key)
      return
    }
    const cleaned = query.trim()
    if (!cleaned) return
    navigate(`/reportes?q=${encodeURIComponent(cleaned)}`)
    setIsSearchOpen(false)
    setQuery('')
  }

  function handleSearchButtonClick() {
    if (!isSearchOpen) {
      setIsSearchOpen(true)
      requestAnimationFrame(() => searchInputRef.current?.focus())
      return
    }
    const cleaned = query.trim()
    if (!cleaned) {
      setIsSearchOpen(false)
      return
    }
    navigate(`/reportes?q=${encodeURIComponent(cleaned)}`)
    setIsSearchOpen(false)
    setQuery('')
  }

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!searchRef.current?.contains(event.target as Node)) {
        setIsSearchOpen(false)
        setActiveIdx(-1)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  function handleSearchInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setIsSearchOpen(false)
      setActiveIdx(-1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => (i < suggestions.length - 1 ? i + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => (i > 0 ? i - 1 : suggestions.length - 1))
    }
  }

  const showSuggestions = isSearchOpen && suggestions.length > 0

  return (
    <header className="sticky top-0 z-40 border-b border-white/15 bg-primary/95 text-white shadow-sm backdrop-blur">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary"
      >
        {t('nav.skipToContent')}
      </a>

      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-5 lg:py-3.5">
        <Link to="/" className="ml-1 flex shrink-0 items-center sm:ml-2">
          <img
            src={imagotipoNegativo}
            alt="BIOTRACK"
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        <nav className="order-3 flex w-full items-center gap-2 overflow-x-auto pb-1 lg:order-none lg:w-auto lg:pb-0" aria-label={t('nav.mainNav')}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:scale-[0.97] ${
                  isActive
                    ? 'bg-white text-primary shadow-[0_6px_14px_-10px_rgba(0,0,0,0.65)]'
                    : 'text-white/85 hover:bg-white/15 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex w-full items-center gap-2 lg:ml-auto lg:w-auto lg:gap-3">
          <div className={`ml-auto ${isSearchOpen ? 'w-full lg:w-[320px]' : 'w-10 lg:w-[320px]'}`}>
            <form
              ref={searchRef}
              onSubmit={handleSearch}
              role="search"
              aria-label={t('nav.searchLabel')}
              className={`relative ml-auto flex min-w-0 items-center overflow-visible rounded-full shadow-sm transition-[width,background-color,border-color,padding,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-within:shadow-[0_0_0_3px_rgba(159,208,253,0.35)] ${
                isSearchOpen
                  ? 'w-full border border-white/30 bg-white pl-4 pr-12'
                  : 'w-10 border border-transparent bg-transparent pl-0 pr-10'
              }`}
            >
              <input
                ref={searchInputRef}
                type="search"
                placeholder={t('nav.searchPlaceholder')}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIdx(-1) }}
                onKeyDown={handleSearchInputKeyDown}
                className={`h-10 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-[width,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isSearchOpen ? 'w-full translate-x-0 opacity-100' : 'w-0 -translate-x-2 opacity-0 pointer-events-none'
                }`}
                tabIndex={isSearchOpen ? 0 : -1}
                autoComplete="off"
              />
              <button
                type="button"
                aria-label={t('nav.searchLabel')}
                onClick={handleSearchButtonClick}
                className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-action text-white transition-colors duration-150 ease-out hover:bg-red-700"
              >
                <Search className="h-4 w-4" />
              </button>

              {showSuggestions && (
                <ul className="absolute left-0 top-12 z-50 w-full overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl">
                  {suggestions.map((s, i) => {
                    const Icon = SUGGESTION_ICONS[s.key] ?? Search
                    return (
                      <li key={s.key}>
                        <button
                          type="button"
                          onMouseDown={() => goTo(s.key)}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                            i === activeIdx
                              ? 'bg-primary/10 text-primary'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                          {s.label}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </form>
          </div>

          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')}
            className="rounded border border-white/40 px-2.5 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:bg-white/15 hover:text-white"
          >
            {i18n.language === 'es' ? 'EN' : 'ES'}
          </button>
          <Link
            to="/login"
            className="rounded px-4 py-2 text-sm font-semibold bg-action text-white transition-[transform,background-color,box-shadow] duration-150 ease-out hover:bg-red-700 active:scale-[0.97]"
          >
            {t('nav.login')}
          </Link>
          <Link
            to="/registro"
            className="rounded border border-white px-4 py-2 text-sm font-semibold text-white transition-[transform,background-color,color,border-color] duration-150 ease-out hover:bg-white/10 active:scale-[0.97]"
          >
            {t('nav.register')}
          </Link>
        </div>
      </div>
    </header>
  )
}
