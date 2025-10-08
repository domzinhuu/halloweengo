import { HalloweenItem, HALLOWEEN_ITEMS } from '../types/halloweenItems';

export function generateCard(): HalloweenItem[][] {
  // Embaralha os 75 items
  const shuffledItems = [...HALLOWEEN_ITEMS].sort(() => Math.random() - 0.5);
  
  // Pega os primeiros 25 items
  const selectedItems = shuffledItems.slice(0, 25);
  
  // Organiza em matriz 5x5
  const card: HalloweenItem[][] = [];
  for (let i = 0; i < 5; i++) {
    card[i] = [];
    for (let j = 0; j < 5; j++) {
      card[i][j] = selectedItems[i * 5 + j];
    }
  }
  
  return card;
}

export function generateCardNumber(): number {
  return Math.floor(Math.random() * 1000000) + 1; // Número entre 1 e 1000000
}

export function checkBingo(markedItems: boolean[][]): boolean {
  // Bingo só é válido se TODA a cartela estiver preenchida (25 itens)
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (!markedItems[i][j]) {
        return false; // Se encontrar algum item não marcado, não é bingo
      }
    }
  }
  
  return true; // Todos os 25 itens marcados = BINGO!
}
