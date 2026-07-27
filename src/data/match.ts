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

function exactMatches(selectedIds: string[]): Recipe[] {
  const selected = new Set(selectedIds)

  return recipes
    .map((recipe) => {
      const hits = recipe.matchedIngredients.filter((id) => selected.has(id))
      const substantialHits = hits.filter((id) => !STAPLES.has(id))
      if (hits.length < 2) return null
      if (substantialHits.length === 0) return null

      const score =
        substantialHits.length * 25 +
        hits.length * 12 +
        (hits.length / selectedIds.length) * 20 +
        (hits.length / Math.max(recipe.matchedIngredients.length, 1)) * 4

      return { recipe, score }
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.recipe)
}

/** pega um clássico que já usa 1 dos itens e adapta pra incluir todos os escolhidos */
function adaptFromCatalog(selectedIds: string[], excludeIds: Set<string>): Recipe[] {
  const selected = new Set(selectedIds)

  const bases = recipes
    .map((recipe) => {
      if (excludeIds.has(recipe.id)) return null
      const hits = recipe.matchedIngredients.filter((id) => selected.has(id))
      if (hits.length < 1) return null
      const missing = selectedIds.filter((id) => !recipe.matchedIngredients.includes(id))
      if (missing.length === 0) return null

      const hitWeight = hits.reduce(
        (sum, id) => sum + (WEIGHT[info(id)?.category ?? 'tempero'] ?? 0),
        0,
      )
      return { recipe, hits, missing, hitWeight }
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => b.hitWeight - a.hitWeight || a.missing.length - b.missing.length)
    .slice(0, 6)

  return bases.map(({ recipe, hits, missing }) => {
    const missingNames = namesList(missing)
    const allNames = namesList(selectedIds)
    return {
      ...recipe,
      id: `adapt-${recipe.id}-${selectedIds.join('-')}`,
      name: `${recipe.name} · com ${missing.map(nameOf).join(' e ')}`,
      vibe: `adaptação da geladeira · base: ${recipe.vibe}`,
      matchedIngredients: [...selectedIds],
      pantryEasy: recipe.pantryEasy,
      substitutions: [
        ...missing.map(
          (id) =>
            `${nameOf(id)}: entra nesta versão — se faltar, troque por outro item da mesma “família” (proteína/legume/base)`,
        ),
        ...recipe.substitutions.slice(0, 2),
      ],
      whyItWorks: `Parte da receita real de ${recipe.chef} (que já usa ${namesList(hits)}). Aqui a gente encaixa também ${missingNames} pra aproveitar tudo que você marcou: ${allNames}.`,
      steps: [
        `Separe o que você marcou: ${allNames}.`,
        ...recipe.steps.slice(0, 2),
        `Inclua ${missingNames} junto no refogado/assadeira/panela — corte em pedaços parecidos pra cozinhar no mesmo tempo.`,
        ...recipe.steps.slice(2),
        `Prove e ajuste sal. Se algo estiver cru demais, tape e dê mais 3–5 min em fogo baixo.`,
      ],
      tip: `É uma adaptação da geladeira em cima de “${recipe.originalName}”. O link original continua sendo a referência completa.`,
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

const TECHNIQUES: Technique[] = [
  {
    id: 'traybake',
    label: 'Assado de assadeira',
    chef: 'Jamie Oliver',
    originalName: 'Chicken / veg traybake method',
    sourceUrl: 'https://www.jamieoliver.com/recipes/chicken/chicken-traybake/',
    sourceLabel: 'JamieOliver.com',
    timeMinutes: 40,
    difficulty: 'fácil',
    style: 'média',
    match: (ids) =>
      hasCat(ids, 'proteina') && (hasCat(ids, 'vegetal') || hasCat(ids, 'fruta')),
    buildSteps: (ids) => [
      `Tempere ${namesList(ids)} com óleo/azeite e sal.`,
      'Espalhe numa assadeira sem amontoar.',
      'Asse em forno quente até a proteína cozinhar e os legumes amaciarem.',
      'Regue com o suco da forma e sirva.',
    ],
    why: (ids) =>
      `Método de traybake do Jamie: ${namesList(ids)} assam juntos e trocam sabor.`,
    tip: 'Se um item cozinha mais rápido, tire antes e deixe o resto.',
    pantryEasy: 'óleo ou azeite · sal',
  },
  {
    id: 'stew',
    label: 'Ensopado de panela',
    chef: 'BBC Good Food',
    originalName: 'Easy casserole / stew method',
    sourceUrl: 'https://www.bbcgoodfood.com/recipes/easy-chicken-casserole',
    sourceLabel: 'BBC Good Food',
    timeMinutes: 45,
    difficulty: 'fácil',
    style: 'conhecida',
    match: (ids) => hasCat(ids, 'proteina') && hasCat(ids, 'vegetal'),
    buildSteps: (ids) => [
      `Doure a proteína de ${namesList(ids)} no óleo.`,
      'Junte os vegetais picados e refogue 2 minutos.',
      'Cubra com água, tampe e cozinhe em fogo baixo até ficar macio.',
      'Ajuste sal e sirva com arroz ou pão se tiver.',
    ],
    why: (ids) =>
      `Ensopado clássico (BBC): ${namesList(ids)} cozinham no mesmo caldo.`,
    tip: 'Água quente se secar — não precisa de caldo pronto.',
    pantryEasy: 'óleo · sal · água',
  },
  {
    id: 'stirfry',
    label: 'Salteado rápido',
    chef: 'BBC Good Food',
    originalName: 'Stir-fry method',
    sourceUrl: 'https://www.bbcgoodfood.com/recipes/chicken-stir-fry',
    sourceLabel: 'BBC Good Food',
    timeMinutes: 20,
    difficulty: 'fácil',
    style: 'diferentona',
    match: (ids) =>
      (hasCat(ids, 'proteina') || hasCat(ids, 'vegetal')) && ids.length >= 2,
    buildSteps: (ids) => [
      `Corte ${namesList(ids)} em pedaços finos e parecidos.`,
      'Aqueça óleo bem quente numa frigideira larga.',
      'Salteie começando pelo que demora mais; vá juntando o resto.',
      'Tempere com sal (ou shoyu se tiver) e sirva.',
    ],
    why: (ids) =>
      `Salteado em fogo alto: ${namesList(ids)} ficam no ponto sem virar papa.`,
    tip: 'Panela lotada vira ensopado — faça em duas fornadas se precisar.',
    pantryEasy: 'óleo · sal',
  },
  {
    id: 'pasta-pan',
    label: 'Massa / base na panela',
    chef: 'Serious Eats',
    originalName: 'Pan sauce pasta method',
    sourceUrl: 'https://www.seriouseats.com/spaghetti-aglio-e-olio-recipe',
    sourceLabel: 'Serious Eats',
    timeMinutes: 25,
    difficulty: 'fácil',
    style: 'conhecida',
    match: (ids) => hasCat(ids, 'base') && !hasCat(ids, 'fruta'),
    buildSteps: (ids) => [
      `Cozinhe a base (massa/arroz/etc.) de ${namesList(ids)} se precisar de água.`,
      'Numa frigideira, prepare o restante dos itens com um fio de óleo.',
      'Junte tudo com um pouco da água do cozimento pra virar molho.',
      'Ajuste sal e sirva imediatamente.',
    ],
    why: (ids) =>
      `Técnica de emulsão na panela (Serious Eats): ${namesList(ids)} viram um prato só.`,
    tip: 'Guarde água da massa/arroz — é o “cola” do molho.',
    pantryEasy: 'sal · óleo ou azeite',
  },
  {
    id: 'egg-bind',
    label: 'Ovos ligando tudo',
    chef: 'Jacques Pépin / Kenji',
    originalName: 'Omelette / frittata method',
    sourceUrl: 'https://www.seriouseats.com/the-best-frittata-recipe',
    sourceLabel: 'Serious Eats',
    timeMinutes: 20,
    difficulty: 'fácil',
    style: 'média',
    match: (ids) => ids.includes('ovo'),
    buildSteps: (ids) => [
      `Pique e refogue o que não é ovo em ${namesList(ids)}.`,
      'Bata os ovos com sal e despeje por cima.',
      'Cozinhe em fogo médio até firmar; tape ou leve ao forno se a frigideira permitir.',
      'Sirva em fatias.',
    ],
    why: (ids) =>
      `Frittata/omelete: o ovo abraça ${namesList(ids.filter((id) => id !== 'ovo')) || 'o resto'}.`,
    tip: 'Não sobrecarregue de recheio — ovo precisa cobrir.',
    pantryEasy: 'sal · óleo ou manteiga',
  },
  {
    id: 'melt',
    label: 'Queijo derretido',
    chef: 'J. Kenji López-Alt',
    originalName: 'Quesadilla / melt method',
    sourceUrl: 'https://www.seriouseats.com/food-lab-great-quesadillas',
    sourceLabel: 'Serious Eats',
    timeMinutes: 15,
    difficulty: 'fácil',
    style: 'conhecida',
    match: (ids) =>
      hasCat(ids, 'lacteo') &&
      (hasCat(ids, 'base') || hasCat(ids, 'proteina') || hasCat(ids, 'vegetal')),
    buildSteps: (ids) => [
      `Monte ${namesList(ids)} em camadas (pão, tortilha, ou frigideira).`,
      'Derreta o lácteo em fogo médio-baixo até grudar tudo.',
      'Doure os dois lados se for sanduíche/quesadilla.',
      'Corte e sirva.',
    ],
    why: (ids) =>
      `Método melt do Kenji: o lácteo une ${namesList(ids)}.`,
    tip: 'Fogo baixo derrete; fogo alto queima antes.',
    pantryEasy: 'óleo pra frigideira se precisar',
  },
  {
    id: 'soup',
    label: 'Sopa batida ou de panela',
    chef: 'BBC Good Food',
    originalName: 'Soup method',
    sourceUrl: 'https://www.bbcgoodfood.com/recipes/carrot-soup',
    sourceLabel: 'BBC Good Food',
    timeMinutes: 30,
    difficulty: 'fácil',
    style: 'média',
    match: (ids) =>
      hasCat(ids, 'vegetal') || hasCat(ids, 'lacteo') || hasCat(ids, 'proteina'),
    buildSteps: (ids) => [
      `Refogue parte de ${namesList(ids)} num fio de óleo.`,
      'Cubra com água e cozinhe até amaciar.',
      'Bata (se quiser cremosa) ou deixe em pedaços; acrescente lácteo no fim se tiver.',
      'Ajuste sal e sirva.',
    ],
    why: (ids) => `Sopa de panela: ${namesList(ids)} viram caldo e corpo.`,
    tip: 'Não ferva forte depois de colocar leite/iogurte.',
    pantryEasy: 'óleo · sal · água',
  },
  {
    id: 'sweet-bowl',
    label: 'Doce rápido de café da manhã',
    chef: 'BBC Good Food',
    originalName: 'Banana pancakes / porridge method',
    sourceUrl: 'https://www.bbcgoodfood.com/recipes/banana-pancakes',
    sourceLabel: 'BBC Good Food',
    timeMinutes: 15,
    difficulty: 'fácil',
    style: 'conhecida',
    match: (ids) => hasCat(ids, 'fruta') || ids.includes('aveia') || ids.includes('leite'),
    buildSteps: (ids) => [
      `Misture/amasse ${namesList(ids)} até formar uma massa ou mingau.`,
      'Aqueça uma frigideira ou panela com pouco óleo/manteiga se for grelhar.',
      'Cozinhe até firmar ou engrossar.',
      'Sirva com mel/açúcar se tiver.',
    ],
    why: (ids) =>
      `Base doce clássica (BBC): ${namesList(ids)} resolvem o café da manhã.`,
    tip: 'Fruta bem madura adoça sem precisar de muito açúcar.',
    pantryEasy: 'óleo ou manteiga · açúcar/mel se quiser',
  },
  {
    id: 'salad-bowl',
    label: 'Tigela fria / salada composta',
    chef: 'Yotam Ottolenghi',
    originalName: 'Composed salad / yoghurt bowl ideas',
    sourceUrl:
      'https://www.theguardian.com/lifeandstyle/2010/jul/16/chickpea-salad-ottolenghi-recipe',
    sourceLabel: 'The Guardian (Ottolenghi)',
    timeMinutes: 15,
    difficulty: 'fácil',
    style: 'diferentona',
    match: (ids) => ids.length >= 2,
    buildSteps: (ids) => [
      `Prepare ${namesList(ids)} (corte, escorra, amasse ou toste leve).`,
      'Misture numa cumbuca com sal e um ácido (limão/vinagre) se tiver.',
      'Regue azeite/óleo e prove.',
      'Sirva frio ou morno.',
    ],
    why: (ids) =>
      `Lógica Ottolenghi de bowl: ${namesList(ids)} + ácido + gordura.`,
    tip: 'Sal no começo e prove de novo no fim — muda tudo.',
    pantryEasy: 'sal · azeite ou óleo · limão/vinagre se tiver',
  },
]

function fromTechniques(selectedIds: string[]): Recipe[] {
  const ranked = sortByWeight(selectedIds)
  const primary = nameOf(ranked[0] ?? selectedIds[0])
  const secondary = namesList(selectedIds.slice(1))

  return TECHNIQUES.filter((t) => t.match(selectedIds)).map((t) => {
    const titleBits = selectedIds.map(nameOf)
    return {
      id: `tech-${t.id}-${selectedIds.join('-')}`,
      name: `${t.label}: ${titleBits.join(' + ')}`,
      chef: t.chef,
      originalName: t.originalName,
      sourceUrl: t.sourceUrl,
      sourceLabel: t.sourceLabel,
      timeMinutes: t.timeMinutes,
      difficulty: t.difficulty,
      style: t.style,
      vibe: 'técnica clássica · usa tudo que você marcou',
      matchedIngredients: [...selectedIds],
      pantryEasy: t.pantryEasy,
      substitutions: selectedIds.map((id) => {
        const cat = info(id)?.category
        if (cat === 'proteina') return `${nameOf(id)} → outra proteína que tiver`
        if (cat === 'vegetal') return `${nameOf(id)} → outro legume duro/macio no mesmo corte`
        if (cat === 'base') return `${nameOf(id)} → arroz, massa, pão ou tapioca`
        if (cat === 'lacteo') return `${nameOf(id)} → outro lácteo cremoso`
        if (cat === 'fruta') return `${nameOf(id)} → outra fruta madura`
        return `${nameOf(id)} → outro tempero da despensa`
      }),
      whyItWorks: t.why(selectedIds),
      steps: t.buildSteps(selectedIds),
      tip: `${t.tip} Foco: ${primary}${secondary ? ` com ${secondary}` : ''}.`,
    } satisfies Recipe
  })
}

/**
 * Sempre devolve ideias que usam TODOS os itens escolhidos (2–4).
 * 1) clássicos exatos do catálogo
 * 2) adaptações de clássicos reais
 * 3) técnicas de chefs famosos aplicadas ao combo
 */
export function findRecipes(selectedIds: string[]): Recipe[] {
  if (selectedIds.length < 2 || selectedIds.length > 4) return []

  const exact = exactMatches(selectedIds)
  const used = new Set(exact.map((r) => r.id))
  const adapted = adaptFromCatalog(selectedIds, used)

  const combined: Recipe[] = []
  const seen = new Set<string>()

  for (const recipe of [...exact, ...adapted, ...fromTechniques(selectedIds)]) {
    // toda receita retornada DEVE listar todos os selecionados
    const covers = selectedIds.every((id) => recipe.matchedIngredients.includes(id))
    if (!covers) continue
    if (seen.has(recipe.id)) continue
    seen.add(recipe.id)
    combined.push(recipe)
    if (combined.length >= 8) break
  }

  return combined
}

export function isAdaptation(recipe: Recipe) {
  return recipe.id.startsWith('adapt-') || recipe.id.startsWith('tech-')
}
