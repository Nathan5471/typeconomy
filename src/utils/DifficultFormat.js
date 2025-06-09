import { getDifficulty } from "./EffectsHandler";

export default function DifficultFormat(word) {
    const difficulty = getDifficulty();
    if (difficulty.upper) {
        if (Math.random() < 0.5) {
            word = word.charAt(0).toUpperCase() + word.slice(1);
        }
    }
    if (difficulty.numbers) {
        const numbers = '0123456789';
        if (Math.random() < 0.5) {
            const randomIndex = Math.floor(Math.random() * word.length);
            word += numbers.charAt(randomIndex);
        }
    }
    if (difficulty.symbols) {
        const symbols = '!@#$%^&*()_+[]{}|;:,.<>?';
        if (Math.random() < 0.5) {
            const randomIndex = Math.floor(Math.random() * word.length);
            word += symbols.charAt(randomIndex);
        }
    }
    return word;
}