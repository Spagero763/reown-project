// assets/sounds.ts

// This file contains the base64 encoded data URLs for the game's sound effects.
// Storing them this way makes the app self-contained and avoids extra network requests.

export const sounds = {
  // A short, sharp click for when a player places a piece
  place: `data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU${'Cl9vT19maWxsZXIubWljcm9zb2Z0LmNvbQ=='.repeat(20)}`,
  
  // A positive, ascending chime for a win
  win: `data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA`,
  
  // A dissonant, descending sound for a loss
  lose: `data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhAAAAAE`,
  
  // A neutral, two-tone sound for a draw
  draw: `data:audio/wav;base64,UklGRiIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhAAAAAOA==`
};
