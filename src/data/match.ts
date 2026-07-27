import { ingredients, type Ingredient } from './ingredients'
import { recipes, type Recipe } from './recipes'

const STAPLES = new Set([
  'alho',
  'azeite',
  'oleo',
  'manteiga',
  'cebola',
  'limao',
  'vinagre',
  'shoyu',
  'mostarda',
  'mel',
  'ketchup',
  'maionese',
  'pimenta',
])

const WEIGHT: Record<Ingredient['category'], number> = {
  proteina: 50,
  base: 40,
  vegetal: 35,
  lacteo: 30,
  fruta: 25,
  tempero: 10,
}

/** quanto mais itens, menos cartas — afunila */
function maxResults(n: number) {
  if (n <= 2) return 4
  if (n === 3) return 3
  return 2
}

function info(id: string) {
  return ingredients.find((x) => x.id === id)
}

function nameOf(id: string) {
  return info(id)?.name ?? id
}

function namesList(ids: string[]) {
  return ids.map(nameOf).join(' · ')
}

function hasCat(ids: string[], cat: Ingredient['category']) {
  return ids.some((id) => info(id)?.category === cat)
}

function sortByWeight(ids: string[]) {
  return [...ids].sort(
    (a, b) =>
      (WEIGHT[info(b)?.category ?? 'tempero'] ?? 0) -
      (WEIGHT[info(a)?.category ?? 'tempero'] ?? 0),
  )
}

type Scored = { recipe: Recipe; score: number; hits: number; full: boolean }

function scoreCatalog(selectedIds: string[]): Scored[] {
  const selected = new Set(selectedIds)
  const n = selectedIds.length

  return recipes
    .map((recipe) => {
      const hits = recipe.matchedIngredients.filter((id) => selected.has(id))
      const substantialHits = hits.filter((id) => !STAPLES.has(id))
      // catálogo exato: tem que usar TODOS os escolhidos (é o afunilamento)
      if (hits.length < n) return null
      if (substantialHits.length === 0) return null

      const extraCores = recipe.matchedIngredients.length - n
      const easyBoost = recipe.difficulty === 'fácil' ? 10 : 0
      const quickBoost =
        recipe.timeMinutes <= 15 ? 10 : recipe.timeMinutes <= 25 ? 5 : 0

      const score =
        100 +
        substantialHits.length * 12 +
        easyBoost +
        quickBoost -
        extraCores * 5 -
        Math.max(0, recipe.timeMinutes - 20) * 0.15

      return { recipe, score, hits: hits.length, full: true }
    })
    .filter((row): row is Scored => row !== null)
    .sort((a, b) => b.score - a.score)
}

function adaptFromCatalog(selectedIds: string[], excludeIds: Set<string>, limit: number): Recipe[] {
  if (limit <= 0) return []
  const selected = new Set(selectedIds)

  const bases = recipes
    .map((recipe) => {
      if (excludeIds.has(recipe.id)) return null
      const hits = recipe.matchedIngredients.filter((id) => selected.has(id))
      // adaptação só se já compartilha a maioria (não enche de lixo)
      if (hits.length < Math.max(1, selectedIds.length - 1)) return null
      const missing = selectedIds.filter((id) => !hits.includes(id))
      if (missing.length === 0) return null
      // no máximo 1 item “encaixado”
      if (missing.length > 1) return null

      const hitWeight = hits.reduce(
        (sum, id) => sum + (WEIGHT[info(id)?.category ?? 'tempero'] ?? 0),
        0,
      )
      const easy = recipe.difficulty === 'fácil' ? 10 : 0
      return { recipe, hits, missing, hitWeight: hitWeight + easy }
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => b.hitWeight - a.hitWeight)
    .slice(0, limit)

  return bases.map(({ recipe, hits, missing }) => {
    const missingNames = namesList(missing)
    const allNames = namesList(selectedIds)
    return {
      ...recipe,
      id: `adapt-${recipe.id}-${selectedIds.join('-')}`,
      name: `${recipe.name} · + ${missing.map(nameOf).join(' e ')}`,
      vibe: `adaptação mínima · ${recipe.vibe}`,
      matchedIngredients: [...selectedIds],
      pantryEasy: recipe.pantryEasy,
      substitutions: [
        `${nameOf(missing[0]!)}: se não tiver, siga a receita original sem ele`,
        ...recipe.substitutions.slice(0, 2),
      ],
      whyItWorks: `Base real de ${recipe.chef} (já com ${namesList(hits)}). Só acrescenta ${missingNames} no mesmo método.`,
      steps: [
        `Use ${allNames}.`,
        ...recipe.steps.slice(0, 2),
        `Quando for a hora dos ingredientes, junte também ${missingNames} (corte fino se cozinhar rápido).`,
        ...recipe.steps.slice(2),
      ],
      tip: `Adaptação leve de “${recipe.originalName}”. Link original = referência completa.`,
    } satisfies Recipe
  })
}

type Technique = {
  id: string
  label: string
  chef: string
  originalName: string
  sourceUrl: string
  sourceLabel: string
  timeMinutes: number
  difficulty: Recipe['difficulty']
  style: Recipe['style']
  match: (ids: string[]) => boolean
  buildSteps: (ids: string[]) => string[]
  why: (ids: string[]) => string
  tip: string
  pantryEasy: string
}

/** técnicas só como rede de segurança — poucas e específicas */
const TECHNIQUES: Technique[] = [
  {
    id: 'onepan',
    label: 'Uma panela só',
    chef: 'BBC Good Food',
    originalName: 'One-pan method',
    sourceUrl: 'https://www.bbcgoodfood.com/recipes/easy-chicken-casserole',
    sourceLabel: 'BBC Good Food',
    timeMinutes: 25,
    difficulty: 'fácil',
    style: 'conhecida',
    match: (ids) =>
      hasCat(ids, 'proteina') && (hasCat(ids, 'vegetal') || hasCat(ids, 'base')),
    buildSteps: (ids) => [
      `Doure o que for proteína em ${namesList(ids)}.`,
      'Junte o resto, um fio de óleo e um pouco de água.',
      'Tampe e cozinhe em fogo médio até ficar macio.',
      'Ajuste sal e sirva.',
    ],
    why: (ids) => `Método one-pan: ${namesList(ids)} no mesmo caldo, sem firula.`,
    tip: 'Água de pouco em pouco — não precisa virar sopa.',
    pantryEasy: 'óleo · sal · água',
  },
  {
    id: 'toast-melt',
    label: 'Torrada / derrete',
    chef: 'Serious Eats',
    originalName: 'Melt / toast method',
    sourceUrl: 'https://www.seriouseats.com/food-lab-great-quesadillas',
    sourceLabel: 'Serious Eats',
    timeMinutes: 10,
    difficulty: 'fácil',
    style: 'conhecida',
    match: (ids) =>
      (hasCat(ids, 'base') || ids.includes('pao') || ids.includes('pao-forma')) &&
      (hasCat(ids, 'lacteo') || hasCat(ids, 'proteina')),
    buildSteps: (ids) => [
      `Monte ${namesList(ids)} no pão ou na frigideira.`,
      'Aqueça em fogo médio-baixo até derreter/grudar.',
      'Doure os dois lados se for sanduíche.',
      'Sirva na hora.',
    ],
    why: (ids) => `Melt rápido: ${namesList(ids)} resolvem o lanche.`,
    tip: 'Fogo baixo derrete; alto queima.',
    pantryEasy: 'óleo se precisar',
  },
  {
    id: 'egg-fix',
    label: 'Ovo salvando o dia',
    chef: 'Jacques Pépin',
    originalName: 'Simple egg scramble / omelette',
    sourceUrl:
      'https://www.kqed.org/arts/13851239/jacques-pepins-secret-to-the-perfect-french-omelette',
    sourceLabel: 'KQED / Jacques Pépin',
    timeMinutes: 10,
    difficulty: 'fácil',
    style: 'conhecida',
    match: (ids) => ids.includes('ovo'),
    buildSteps: (ids) => [
      `Pique o que não for ovo em ${namesList(ids)} e refogue rápido.`,
      'Bata os ovos com sal, despeje e mexa em fogo médio.',
      'Quando quase pronto, misture tudo.',
      'Sirva com pão ou arroz se tiver.',
    ],
    why: (ids) => `Ovo liga ${namesList(ids)} em minutos — clássico de poucos recursos.`,
    tip: 'Tire do fogo um pouco antes — ovo continua cozinhando.',
    pantryEasy: 'sal · óleo ou manteiga',
  },
]

function fromTechniques(selectedIds: string[], limit: number): Recipe[] {
  if (limit <= 0) return []
  const ranked = sortByWeight(selectedIds)
  const primary = nameOf(ranked[0] ?? selectedIds[0])

  return TECHNIQUES.filter((t) => t.match(selectedIds))
    .slice(0, limit)
    .map((t) => ({
      id: `tech-${t.id}-${selectedIds.join('-')}`,
      name: `${t.label}: ${selectedIds.map(nameOf).join(' + ')}`,
      chef: t.chef,
      originalName: t.originalName,
      sourceUrl: t.sourceUrl,
      sourceLabel: t.sourceLabel,
      timeMinutes: t.timeMinutes,
      difficulty: t.difficulty,
      style: t.style,
      vibe: 'plano B · poucos recursos',
      matchedIngredients: [...selectedIds],
      pantryEasy: t.pantryEasy,
      substitutions: selectedIds.map(
        (id) => `${nameOf(id)} → outro da mesma categoria se precisar`,
      ),
      whyItWorks: t.why(selectedIds),
      steps: t.buildSteps(selectedIds),
      tip: `${t.tip} Foco: ${primary}.`,
    }))
}

/**
 * Afunila: 2 itens → até 4 ideias; 3 → 3; 4 → 2.
 * Prioridade: clássico exato (usa tudo) → 1 adaptação mínima → técnica só se vazio.
 */
export function findRecipes(selectedIds: string[]): Recipe[] {
  if (selectedIds.length < 2 || selectedIds.length > 4) return []

  const limit = maxResults(selectedIds.length)
  const scored = scoreCatalog(selectedIds)
  const exact = scored.map((s) => s.recipe)

  const combined: Recipe[] = []
  const seen = new Set<string>()

  const push = (list: Recipe[]) => {
    for (const recipe of list) {
      if (combined.length >= limit) break
      if (seen.has(recipe.id)) continue
      if (!selectedIds.every((id) => recipe.matchedIngredients.includes(id))) continue
      seen.add(recipe.id)
      combined.push(recipe)
    }
  }

  push(exact)

  if (combined.length < limit) {
    const need = limit - combined.length
    // só adapta se ainda faltam slots; no máx 1 adaptação quando n>=3
    const adaptLimit = selectedIds.length >= 3 ? Math.min(1, need) : Math.min(2, need)
    push(adaptFromCatalog(selectedIds, new Set(exact.map((r) => r.id)), adaptLimit))
  }

  if (combined.length === 0) {
    push(fromTechniques(selectedIds, 1))
  }

  return combined
}

export function isAdaptation(recipe: Recipe) {
  return recipe.id.startsWith('adapt-') || recipe.id.startsWith('tech-')
}
