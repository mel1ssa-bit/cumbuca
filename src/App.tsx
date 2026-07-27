import { useMemo, useState } from 'react'
import { ingredients } from './data/ingredients'
import { recipeImage } from './data/images'
import { findRecipes, isAdaptation } from './data/match'
import type { Recipe } from './data/recipes'
import './App.css'

const MIN = 2
const MAX = 4

function BowlLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      width="28"
      height="28"
      aria-hidden
    >
      <path
        d="M5 16 Q5 31 20 34 Q35 31 35 16"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <ellipse
        cx="20"
        cy="15.5"
        rx="15.2"
        ry="4.2"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      <ellipse
        cx="20"
        cy="15.5"
        rx="9.5"
        ry="2.2"
        fill="currentColor"
        fillOpacity="0.22"
      />
    </svg>
  )
}

export default function App() {
  const [view, setView] = useState<'home' | 'ideias'>('home')
  const [selected, setSelected] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<Recipe | null>(null)

  const countLabel = useMemo(() => {
    if (selected.length === 0) return 'escolhe 2 a 4'
    if (selected.length < MIN) return `falta ${MIN - selected.length}`
    return `${selected.length} ok`
  }, [selected.length])

  const filteredIngredients = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ingredients
    return ingredients.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.id.includes(q),
    )
  }, [query])

  const results = useMemo(
    () => (view === 'ideias' ? findRecipes(selected) : []),
    [view, selected],
  )

  const selectedNames = selected
    .map((id) => ingredients.find((x) => x.id === id)?.name)
    .filter(Boolean)

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX) return prev
      return [...prev, id]
    })
  }

  function openIdeias() {
    if (selected.length < MIN || selected.length > MAX) return
    setActive(null)
    setView('ideias')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function backHome() {
    setView('home')
    setActive(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={`app ${view === 'ideias' ? 'app-ideias' : ''}`}>
      <div className="bg-grid" aria-hidden />
      <div className="bg-glow bg-glow-a" aria-hidden />
      {view === 'home' && <div className="bg-glow bg-glow-b" aria-hidden />}

      <header className="topbar">
        <button type="button" className="brand-lockup" onClick={backHome}>
          <span className="brand-mark">
            <BowlLogo />
          </span>
          <span className="brand-name">cumbuca</span>
        </button>
        {view === 'ideias' ? (
          <button type="button" className="status-chip link-chip" onClick={backHome}>
            ← geladeira
          </button>
        ) : (
          <span className="status-chip quiet">2–4 itens</span>
        )}
      </header>

      <main>
        {view === 'home' ? (
          <>
            <section className="hero">
              <div className="hero-copy">
                <p className="hero-kicker">vamos cozinhar</p>
                <h1 className="hero-brand">cumbuca</h1>
                <p className="hero-line">
                  Te mando receitas reais de chefs, fáceis e criativas.
                </p>
              </div>
            </section>

            <section id="lab" className="lab">
              <div className="section-head">
                <h2>o que tem aí?</h2>
                <p>Marca 2 a 4. Digita pra achar mais rápido.</p>
              </div>

              <div className="control-bar">
                <div className={`meter ${selected.length >= MIN ? 'ready' : ''}`}>
                  <span className="meter-dots">
                    {Array.from({ length: MAX }).map((_, i) => (
                      <i key={i} className={i < selected.length ? 'on' : ''} />
                    ))}
                  </span>
                  <strong>{countLabel}</strong>
                </div>
                <div className="control-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setSelected([])}
                    disabled={!selected.length}
                  >
                    limpar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openIdeias}
                    disabled={selected.length < MIN}
                  >
                    cozinhar ideias
                  </button>
                </div>
              </div>

              <label className="search-wrap">
                <span className="sr-only">Buscar alimento</span>
                <input
                  type="search"
                  className="search-input"
                  placeholder="procurar alimento…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                />
              </label>

              {selected.length > 0 && (
                <ul className="selected-row">
                  {selected.map((id) => {
                    const item = ingredients.find((x) => x.id === id)
                    if (!item) return null
                    return (
                      <li key={id}>
                        <button type="button" onClick={() => toggle(id)}>
                          <span>{item.emoji}</span> {item.name} ×
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}

              <div className="ingredient-grid">
                {filteredIngredients.map((item) => {
                  const on = selected.includes(item.id)
                  const locked = !on && selected.length >= MAX
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`ingredient ${on ? 'on' : ''} ${locked ? 'locked' : ''}`}
                      onClick={() => toggle(item.id)}
                      disabled={locked}
                      aria-pressed={on}
                    >
                      <span className="ingredient-emoji">{item.emoji}</span>
                      <span className="ingredient-name">{item.name}</span>
                    </button>
                  )
                })}
              </div>
              {filteredIngredients.length === 0 && (
                <p className="empty-search">Nada com “{query}”.</p>
              )}
            </section>
          </>
        ) : (
          <>
            <section className="ideias-head">
              <p className="hero-kicker">vamos cozinhar</p>
              <h1>ideias pra você</h1>
              <p>
                {selectedNames.join(' · ')}
                {selected.length >= 3
                  ? ' · combo maior = lista mais curta'
                  : ''}
              </p>
            </section>

            {results.length === 0 ? (
              <p className="empty-search">
                Algo deu errado nesse combo. Volta e tenta de novo.
              </p>
            ) : (
              <ul className="photo-grid">
                {results.map((recipe) => {
                  const open = active?.id === recipe.id
                  const adapted = isAdaptation(recipe)
                  return (
                    <li
                      key={recipe.id}
                      className={`photo-card ${open ? 'open' : ''}`}
                    >
                      <button
                        type="button"
                        className="photo-card-btn"
                        onClick={() => setActive(open ? null : recipe)}
                      >
                        <div className="photo-frame">
                          <img
                            src={recipeImage(recipe.id)}
                            alt={recipe.name}
                            loading="lazy"
                          />
                          <div className="photo-wash" aria-hidden />
                          <div className="photo-meta">
                            <span className="time">{recipe.timeMinutes} min</span>
                            <span className="pill">
                              {adapted ? 'adaptação' : recipe.difficulty}
                            </span>
                          </div>
                        </div>
                        <div className="photo-copy">
                          <h2>{recipe.name}</h2>
                          <p className="chef">por {recipe.chef}</p>
                          <p className="uses">usa: {selectedNames.join(' · ')}</p>
                        </div>
                      </button>
                      {open && (
                        <RecipeDetail recipe={recipe} selected={selected} />
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
      </main>

      {view === 'home' && (
        <footer className="footer">
          <p>cumbuca · chefs reais · trocas fáceis pra não sair de casa</p>
        </footer>
      )}
    </div>
  )
}

function RecipeDetail({
  recipe,
  selected,
}: {
  recipe: Recipe
  selected: string[]
}) {
  const hits = recipe.matchedIngredients.filter((id) => selected.includes(id))
  const hitNames = hits
    .map((id) => ingredients.find((x) => x.id === id)?.name)
    .filter(Boolean)

  return (
    <article className="detail">
      <div className="detail-photo">
        <img src={recipeImage(recipe.id)} alt={recipe.name} />
      </div>

      <p className="why">{recipe.whyItWorks}</p>

      <div className="detail-tags">
        <div>
          <span className="label">da sua escolha</span>
          <p>{hitNames.join(' · ') || '—'}</p>
        </div>
        <div>
          <span className="label">extra fácil em casa</span>
          <p>{recipe.pantryEasy}</p>
        </div>
      </div>

      <div className="subs-box">
        <span className="label">trocas — sem sair</span>
        <ul>
          {recipe.substitutions.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>

      <ol className="steps">
        {recipe.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <p className="tip">
        <span>dica</span> {recipe.tip}
      </p>

      <p className="source-inline">
        <a href={recipe.sourceUrl} target="_blank" rel="noreferrer">
          {recipe.sourceLabel}: {recipe.originalName} ↗
        </a>
      </p>
    </article>
  )
}
