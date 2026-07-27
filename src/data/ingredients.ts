export type Ingredient = {
  id: string
  name: string
  emoji: string
  category: 'proteina' | 'vegetal' | 'lacteo' | 'base' | 'tempero' | 'fruta'
}

export const ingredients: Ingredient[] = [
  // proteínas
  { id: 'ovo', name: 'Ovos', emoji: '🥚', category: 'proteina' },
  { id: 'frango', name: 'Frango', emoji: '🍗', category: 'proteina' },
  { id: 'carne', name: 'Carne moída', emoji: '🥩', category: 'proteina' },
  { id: 'bife', name: 'Bife', emoji: '🍖', category: 'proteina' },
  { id: 'salsicha', name: 'Salsicha', emoji: '🌭', category: 'proteina' },
  { id: 'presunto', name: 'Presunto', emoji: '🥓', category: 'proteina' },
  { id: 'bacon', name: 'Bacon', emoji: '🥓', category: 'proteina' },
  { id: 'atum', name: 'Atum', emoji: '🐟', category: 'proteina' },
  { id: 'sardinha', name: 'Sardinha', emoji: '🐟', category: 'proteina' },
  { id: 'camarao', name: 'Camarão', emoji: '🦐', category: 'proteina' },
  { id: 'tofu', name: 'Tofu', emoji: '🧊', category: 'proteina' },
  { id: 'grao-bico', name: 'Grão-de-bico', emoji: '🟡', category: 'proteina' },
  { id: 'lentilha', name: 'Lentilha', emoji: '🟠', category: 'proteina' },

  // lácteos
  { id: 'queijo', name: 'Queijo', emoji: '🧀', category: 'lacteo' },
  { id: 'mussarela', name: 'Mussarela', emoji: '🧀', category: 'lacteo' },
  { id: 'requeijao', name: 'Requeijão', emoji: '🫙', category: 'lacteo' },
  { id: 'creme-leite', name: 'Creme de leite', emoji: '🥛', category: 'lacteo' },
  { id: 'leite', name: 'Leite', emoji: '🥛', category: 'lacteo' },
  { id: 'iogurte', name: 'Iogurte', emoji: '🫙', category: 'lacteo' },
  { id: 'manteiga', name: 'Manteiga', emoji: '🧈', category: 'lacteo' },
  { id: 'creme-queijo', name: 'Cream cheese', emoji: '🧀', category: 'lacteo' },

  // vegetais
  { id: 'tomate', name: 'Tomate', emoji: '🍅', category: 'vegetal' },
  { id: 'cebola', name: 'Cebola', emoji: '🧅', category: 'vegetal' },
  { id: 'alho', name: 'Alho', emoji: '🧄', category: 'vegetal' },
  { id: 'batata', name: 'Batata', emoji: '🥔', category: 'vegetal' },
  { id: 'batata-doce', name: 'Batata-doce', emoji: '🍠', category: 'vegetal' },
  { id: 'cenoura', name: 'Cenoura', emoji: '🥕', category: 'vegetal' },
  { id: 'abobrinha', name: 'Abobrinha', emoji: '🥒', category: 'vegetal' },
  { id: 'berinjela', name: 'Berinjela', emoji: '🍆', category: 'vegetal' },
  { id: 'espinafre', name: 'Espinafre', emoji: '🥬', category: 'vegetal' },
  { id: 'alface', name: 'Alface', emoji: '🥬', category: 'vegetal' },
  { id: 'couve', name: 'Couve', emoji: '🥬', category: 'vegetal' },
  { id: 'brocolis', name: 'Brócolis', emoji: '🥦', category: 'vegetal' },
  { id: 'couve-flor', name: 'Couve-flor', emoji: '🥦', category: 'vegetal' },
  { id: 'pimentao', name: 'Pimentão', emoji: '🫑', category: 'vegetal' },
  { id: 'milho', name: 'Milho', emoji: '🌽', category: 'vegetal' },
  { id: 'ervilha', name: 'Ervilha', emoji: '🟢', category: 'vegetal' },
  { id: 'cogumelo', name: 'Cogumelo', emoji: '🍄', category: 'vegetal' },
  { id: 'pepino', name: 'Pepino', emoji: '🥒', category: 'vegetal' },
  { id: 'rucula', name: 'Rúcula', emoji: '🌿', category: 'vegetal' },
  { id: 'mandioca', name: 'Mandioca', emoji: '🥔', category: 'vegetal' },

  // frutas
  { id: 'banana', name: 'Banana', emoji: '🍌', category: 'fruta' },
  { id: 'limao', name: 'Limão', emoji: '🍋', category: 'fruta' },
  { id: 'maca', name: 'Maçã', emoji: '🍎', category: 'fruta' },
  { id: 'laranja', name: 'Laranja', emoji: '🍊', category: 'fruta' },
  { id: 'morango', name: 'Morango', emoji: '🍓', category: 'fruta' },
  { id: 'abacate', name: 'Abacate', emoji: '🥑', category: 'fruta' },

  // bases
  { id: 'arroz', name: 'Arroz', emoji: '🍚', category: 'base' },
  { id: 'macarrao', name: 'Macarrão', emoji: '🍝', category: 'base' },
  { id: 'pao', name: 'Pão', emoji: '🍞', category: 'base' },
  { id: 'pao-forma', name: 'Pão de forma', emoji: '🍞', category: 'base' },
  { id: 'feijao', name: 'Feijão', emoji: '🫘', category: 'base' },
  { id: 'aveia', name: 'Aveia', emoji: '🥣', category: 'base' },
  { id: 'tortilha', name: 'Tortilha', emoji: '🫓', category: 'base' },
  { id: 'tapioca', name: 'Tapioca', emoji: '⚪', category: 'base' },
  { id: 'cuscuz', name: 'Cuscuz', emoji: '🟡', category: 'base' },
  { id: 'farinha', name: 'Farinha', emoji: '🌾', category: 'base' },
  { id: 'polenta', name: 'Fubá / polenta', emoji: '🌽', category: 'base' },

  // temperos / despensa fácil
  { id: 'azeite', name: 'Azeite', emoji: '🫒', category: 'tempero' },
  { id: 'oleo', name: 'Óleo', emoji: '🫙', category: 'tempero' },
  { id: 'molho-tomate', name: 'Molho de tomate', emoji: '🥫', category: 'tempero' },
  { id: 'mostarda', name: 'Mostarda', emoji: '🟡', category: 'tempero' },
  { id: 'mel', name: 'Mel', emoji: '🍯', category: 'tempero' },
  { id: 'shoyu', name: 'Shoyu', emoji: '🧴', category: 'tempero' },
  { id: 'vinagre', name: 'Vinagre', emoji: '🍾', category: 'tempero' },
  { id: 'maionese', name: 'Maionese', emoji: '🥄', category: 'tempero' },
  { id: 'ketchup', name: 'Ketchup', emoji: '🍅', category: 'tempero' },
  { id: 'pimenta', name: 'Pimenta', emoji: '🌶️', category: 'tempero' },
]
