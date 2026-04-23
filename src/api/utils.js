//public funkce k dispozici pro osttaní soubory; symuluje síťovou latenci a vytíženost serveru
export function delay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}