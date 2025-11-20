// src/utils/game.js
export const SUITS = ['♠', '♥', '♦', '♣'];
export const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

export function generateDeck() {
  const deck = [];
  let id = 0;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ id: `card-${id++}`, rank, suit });
    }
  }
  return deck;
}

export function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}