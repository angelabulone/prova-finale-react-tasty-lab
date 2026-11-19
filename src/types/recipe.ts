// caratteristiche che avranno gli ingredienti e le ricette 
export interface Ingredient {
  name: string;
  amount: number | string; 
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  category: string;
  nationality: string;
  servings: number;
  favorite: boolean;
  imageUrl?: string;
  ingredients: Ingredient[];
  instructions: string;
  sourceType: "personal" | "web";
  sourceUrl?: string;
  customNotes?: string;
}

// qui vengono definite le unità di misura come costanti che vengono suggerite all'utente nel modulo di inserimento
export const UNITA_MISURA = [
  "g",
  "dag",
  "hg",
  "kg",
  "ml",
  "cl",
  "dl",
  "l",
  "pz",
  "cucchiai",
  "cucchiaini",
  "tazze",
  "spicchi",
  "fette",
  "pizzico",
  "q.b.",
] as const;

// funzione pura che riceve in input i 4 parametri e restituisce un oggetto
export function formattaDoseScalata(
  amount: number | string | undefined,
  unit: string | undefined,
  originalServings: number,
  targetServings: number,
): { testo: string; isQb: boolean } {
  // pulizia e normalizzazione delle quantità e delle unità di misura
  const rawAmount = amount != null ? String(amount).trim() : "";  
  const rawUnit = unit != null ? String(unit).trim() : "";

  if (
    (!rawAmount && (!rawUnit || rawUnit.toLowerCase() === "q.b.")) || //se la quantità e l'unità sono vuoti o è q.b.
    rawAmount.toLowerCase() === "q.b." || //se la quantità e' q.b
    rawAmount.toLowerCase() === "qb" //se la quantità e' qb
  ) {
    return { testo: "q.b.", isQb: true }; //restituisce immediatamente q.b.
  }

  const normalizzato = rawAmount.replace(",", "."); //sostituisce la virgola con il punto
  const valoreNumerico = Number(normalizzato); // converte il valore normalizzato con  la f. Number
  const isNumeroValido =
    normalizzato !== "" && !Number.isNaN(valoreNumerico) && valoreNumerico > 0;

  if (!isNumeroValido) {
    const combinato =
      rawUnit && rawUnit !== rawAmount ? `${rawAmount} ${rawUnit}` : rawAmount;
    return { testo: combinato || "q.b.", isQb: true };
  }

  const base = originalServings > 0 ? originalServings : 1; // fallback a 1 se le porzioni sono <=0
  const target = targetServings > 0 ? targetServings : 1; 
  const scalato =
    Math.round(((valoreNumerico / base) * target + Number.EPSILON) * 100) / 100;

  if (rawUnit && rawUnit.toLowerCase() !== "q.b.") {
    return { testo: `${scalato} ${rawUnit}`, isQb: false };
  }

  return { testo: String(scalato), isQb: false };
}

//funzione pura per il riconoscimento della bandiera
export function getCountryFlag(nationality?: string | null): string {
  if (!nationality) return "🌍";
  const nat = nationality.toLowerCase().trim();

  if (nat.includes("austr") && !nat.includes("austral")) return "🇦🇹";
  if (nat.includes("austral")) return "🇦🇺";
  if (nat.includes("ital")) return "🇮🇹";
  if (nat.includes("messic") || nat.includes("mexic")) return "🇲🇽";
  if (nat.includes("giappon") || nat.includes("japan")) return "🇯🇵";
  if (nat.includes("americ") || nat === "usa" || nat.includes("statunitens"))
    return "🇺🇸";
  if (nat.includes("franc") || nat.includes("french")) return "🇫🇷";
  if (nat.includes("spagn") || nat.includes("spani") || nat.includes("spain"))
    return "🇪🇸";
  if (
    nat.includes("tedesc") ||
    nat.includes("german") ||
    nat.includes("deutsch")
  )
    return "🇩🇪";
  if (
    nat.includes("svizzer") ||
    nat.includes("swiss") ||
    nat.includes("schweiz")
  )
    return "🇨🇭";
  if (
    nat.includes("ingles") ||
    nat.includes("inghilter") ||
    nat.includes("british") ||
    nat === "uk"
  )
    return "🇬🇧";
  if (nat.includes("grec")) return "🇬🇷";
  if (nat.includes("cin") || nat.includes("chin")) return "🇨🇳";
  if (nat.includes("indi")) return "🇮🇳";
  if (nat.includes("turc") || nat.includes("turk")) return "🇹🇷";
  if (nat.includes("marocc") || nat.includes("morocc")) return "🇲🇦";
  if (nat.includes("brasil") || nat.includes("brazil")) return "🇧🇷";
  if (nat.includes("argentin")) return "🇦🇷";
  if (nat.includes("thail") || nat === "thai") return "🇹🇭";
  if (nat.includes("vietnam")) return "🇻🇳";
  if (nat.includes("corea") || nat.includes("korea")) return "🇰🇷";
  if (nat.includes("portog") || nat.includes("portug")) return "🇵🇹";
  if (
    nat.includes("oland") ||
    nat.includes("dutch") ||
    nat.includes("netherland")
  )
    return "🇳🇱";
  if (nat.includes("belg")) return "🇧🇪";
  if (nat.includes("sved") || nat.includes("swed")) return "🇸🇪";
  if (nat.includes("norveg") || nat.includes("norway")) return "🇳🇴";
  if (nat.includes("irland") || nat.includes("irish")) return "🇮🇪";
  if (
    nat.includes("polacc") ||
    nat.includes("polon") ||
    nat.includes("polish")
  )
    return "🇵🇱";
  if (nat.includes("ungher") || nat.includes("hungar")) return "🇭🇺";
  if (nat.includes("egiz") || nat.includes("egypt")) return "🇪🇬";
  if (nat.includes("liban")) return "🇱🇧";
  if (nat.includes("peruv") || nat.includes("peru")) return "🇵🇪";

  return "🌍";
}
