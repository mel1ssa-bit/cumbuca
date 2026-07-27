/**
 * Uma foto por receita (Unsplash).
 * Cada `photo-…` aparece uma vez só no catálogo.
 */
const U = (id: string) =>
  `https://images.unsplash.com/${id}?w=800&q=80&auto=format&fit=crop`

export const recipeImages: Record<string, string> = {
  'hazan-tomato': U('photo-1621996346565-e3dbc646d9a9'),
  carbonara: U('photo-1612874742237-6526221588e3'),
  'aglio-olio': U('photo-1551183053-bf91a1d81141'),
  'tortilla-espanola': U('photo-1565299585323-38d6b0865b47'),
  shakshuka: U('photo-1590412200255-2b8612c5a4c0'),
  'french-toast': U('photo-1484723091739-30a097e8f929'),
  'nigella-banana': U('photo-1506084868230-bb9d95c24759'),
  'jamie-chicken-lemon': U('photo-1604908177522-440442e6684b'),
  quesadilla: U('photo-1618040996337-56904b7850b9'),
  caprese: U('photo-1608897013039-887f21d8c804'),
  'jamie-frittata': U('photo-1626700051175-6818013e1d4f'),
  'tuna-pasta': U('photo-1555949258-eb67b1ef0ceb'),
  'honey-mustard-chicken': U('photo-1532550907401-a500c9a57435'),
  'broccoli-cheese': U('photo-1628773822503-930a7eaecf80'),
  'pepin-omelette': U('photo-1510693206972-df098062cb71'),
  'carrot-soup': U('photo-1476718406336-bb5a9690ee2a'),
  'zucchini-pasta': U('photo-1473093295043-cdd812d0e601'),
  'rice-egg': U('photo-1512058564366-18510be2db19'),
  'feijao-tropeiro-light': U('photo-1596797038530-2c107229654b'),
  'potato-roast': U('photo-1633436375795-12b3b339710d'),
  'yogurt-cucumber-ish': U('photo-1505253758473-96b7015fcd40'),
  'tuna-salad': U('photo-1626645738196-c2a7c87a8f58'),
  'garlic-butter-bread': U('photo-1573140247632-f8fd74997d5c'),
  'tofu-stirfry': U('photo-1546069901-d5bfd2cbfb1f'),
  'carne-molho': U('photo-1551892374-ecf8754cf8b0'),
  'avocado-toast': U('photo-1541519227354-08fa5d50c44d'),
  'cuscuz-nordestino': U('photo-1589302168068-964664d93dc0'),
  crepioca: U('photo-1567620905732-2d1ec7ab7445'),
  'chickpea-salad': U('photo-1512621776951-a57141f2eefd'),
  'sausage-pepper': U('photo-1529042410759-befb1204b468'),
  'miso-ish-shoyu-egg': U('photo-1533089860892-a7c6f0a88666'),
  'ratatouille-easy': U('photo-1572453800999-e8d2d1589b7c'),
  'apple-cinnamon-oats': U('photo-1517673132405-a56a62b18caf'),

  'chicken-casserole': U('photo-1574653853027-5382a3d1a310'),
  'chicken-traybake': U('photo-1598103442097-8b74394b95c6'),
  'chicken-carrot-soup': U('photo-1547592166-23ac45744acd'),
  'chicken-stir-carrot': U('photo-1604908176997-125f25cc6f3d'),

  'egg-rice-viral': U('photo-1603133872878-684f208fb84b'),
  'egg-in-hole': U('photo-1525351484163-7529414344d8'),
  'tomato-egg': U('photo-1482049016688-2d3e1b311543'),
  'pf-simples': U('photo-1546833998-877b37c2e5c6'),
  'miojo-ovo': U('photo-1569718212165-3a8278d5f624'),
  'cheese-toast': U('photo-1528736235302-52922df5c122'),
  'presunto-queijo': U('photo-1481070414801-51fd732d7184'),
  'salsicha-ovo': U('photo-1608039829572-78524f79c4c8'),
  'banana-leite': U('photo-1553530666-ba11a7da3888'),
  'batata-micro': U('photo-1518013431117-eb782616e93b'),
  'atum-pao': U('photo-1553909489-cd47e0907980'),
  'milho-manteiga': U('photo-1551754655-cd27e38d2076'),
  'iogurte-banana': U('photo-1488477181946-6428a0291777'),
  'requeijao-pao': U('photo-1509440159596-0249088772ff'),
  'cenoura-refogada': U('photo-1447172913250-aca7c0d5b4c5'),
  'abobrinha-ovo': U('photo-1592419044706-39796d40f98c'),
  'carne-arroz': U('photo-1588168333986-5078d3ae3976'),
  'tofu-shoyu': U('photo-1582576163090-57a9c95ba145'),
  'morango-iogurte': U('photo-1488900123128-7dea8140d4bf'),
  'cuscuz-manteiga': U('photo-1586444248902-2f64eddc13df'),
  'omelete-presunto': U('photo-1608039755401-742074f0548d'),
}

const TECH_IMAGES: Record<string, string> = {
  onepan: U('photo-1467003909585-2f8a72700288'),
  'toast-melt': U('photo-1571091718767-18b5b1457add'),
  'egg-fix': U('photo-1490645935967-10de6ba17061'),
}

export function recipeImage(id: string): string {
  if (recipeImages[id]) return recipeImages[id]

  if (id.startsWith('adapt-')) {
    const rest = id.slice('adapt-'.length)
    const keys = Object.keys(recipeImages).sort((a, b) => b.length - a.length)
    for (const key of keys) {
      if (rest === key || rest.startsWith(`${key}-`)) return recipeImages[key]
    }
  }

  if (id.startsWith('tech-')) {
    for (const [key, url] of Object.entries(TECH_IMAGES)) {
      if (id.startsWith(`tech-${key}`)) return url
    }
  }

  return U('photo-1495521821757-a1efb6729352')
}
