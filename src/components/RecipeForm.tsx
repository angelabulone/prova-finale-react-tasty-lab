import { useState } from "react";
import type { Ingredient, Recipe } from "../types/recipe";
import { getCountryFlag, UNITA_MISURA } from "../types/recipe";
import SectionBox from "./SectionBox";

//tipizziamo le props di RecipeForm
interface RecipeFormProps {
  initialRecipe?: Recipe | null; //se si attiva la modalità modifica, prende Recipe, altrimenti crea la modalità nuova ricetta
  onSave: (ricetta: Recipe) => void; //passa la ricetta salvata con una callback al genitore App.tsx che la salva in localStorage
  onCancel: () => void; //callback invocata con il tasto annulla o chiudi
}
//array con categorie di ricette selezionabili dal menu a tendina
const CATEGORIE_FORM = [
  "Primo",
  "Secondo",
  "Dolce",
  "Contorno",
  "Piatto Unico",
] as const;

//componente con destrutturazione delle props
export default function RecipeForm({
  initialRecipe,
  onSave,
  onCancel,
}: RecipeFormProps) {
  const isModifica = Boolean(initialRecipe); //vale true se la ricetta esiste (e quindi si sta modificando) altrimenti false (creazione)

  const [title, setTitle] = useState(initialRecipe?.title ?? ""); 
  const [category, setCategory] = useState(initialRecipe?.category ?? "Dolce");
  const [nationality, setNationality] = useState(
    initialRecipe?.nationality ?? "Italiana",
  );
  const [servings, setServings] = useState<number>(
    initialRecipe?.servings ?? 4,
  );
  const [sourceType, setSourceType] = useState<"personal" | "web">(
    initialRecipe?.sourceType ?? "personal",
  );
  const [imageUrl, setImageUrl] = useState(initialRecipe?.imageUrl ?? "");
  const [customNotes, setCustomNotes] = useState(
    initialRecipe?.customNotes ?? "",
  );
  const [instructions, setInstructions] = useState(
    initialRecipe?.instructions ?? "",
  );

  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialRecipe?.ingredients && initialRecipe.ingredients.length > 0
      ? initialRecipe.ingredients
      : [{ name: "", amount: "", unit: "g" }],
  );

  const [errore, setErrore] = useState<string | null>(null);

  //con spread oper. teniamo in memoria gli ingredienti precedenti e aggiungiamo la nuova riga da compilare
  const aggiungiRigaIngrediente = () => {
    setIngredients((prev) => [...prev, { name: "", amount: "", unit: "g" }]);
  };

  const rimuoviRigaIngrediente = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const aggiornaIngrediente = (
    index: number,
    campo: keyof Ingredient,
    valore: string,
  ) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [campo]: valore } : ing)),
    );
  };

  const impostaQb = (index: number) => {
    setIngredients((prev) =>
      prev.map((ing, i) =>
        i === index ? { ...ing, amount: "q.b.", unit: "" } : ing,
      ),
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

 //funzione per l'invio del form e la gestione degli errori
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrore(null);

    if (title.trim().length < 3) {
      setErrore("Il titolo è obbligatorio (almeno 3 caratteri).");
      return;
    }
    if (!nationality.trim()) {
      setErrore(
        "Inserisci la cucina o nazionalità (es. Italiana, Austriaca, Francese...).",
      );
      return;
    }
    if (servings < 1 || servings > 50) {
      setErrore("Il numero di porzioni base deve essere tra 1 e 50.");
      return;
    }

    //pulizia e normalizzazione degli ingredienti
    const ingredientiValidi: Ingredient[] = ingredients
      .filter((ing) => ing.name.trim().length > 0)
      .map((ing) => {
        const rawAmount = String(ing.amount ?? "").trim();
        const rawUnit = String(ing.unit ?? "").trim();

        if (!rawAmount || rawAmount.toLowerCase() === "q.b.") {
          return { name: ing.name.trim(), amount: "q.b.", unit: "" };
        }

        const normalizzato = rawAmount.replace(",", ".");
        const numero = Number(normalizzato);
        const amountFinale =
          !Number.isNaN(numero) && numero > 0 ? numero : rawAmount;

        return {
          name: ing.name.trim(),
          amount: amountFinale,
          unit: rawUnit.toLowerCase() === "q.b." ? "" : rawUnit,
        };
      });

    if (ingredientiValidi.length === 0) {
      setErrore("Inserisci almeno un ingrediente con il suo nome.");
      return;
    }

    if (instructions.trim().length < 10) {
      setErrore("Scrivi il procedimento della ricetta (almeno 10 caratteri).");
      return;
    }

    // costruisce il nuovo oggetto ricetta normalizzato e pronto per il salvataggio
    const ricettaSalvata: Recipe = {
      id: initialRecipe?.id ?? `rec-${Date.now()}`, //in modifica mantiene il vecchio id, se crea nuova usa la data attuale
      title: title.trim(),
      category,
      nationality: nationality.trim(),
      servings: Number(servings),
      favorite: initialRecipe?.favorite ?? false,
      imageUrl: imageUrl.trim() || undefined,
      ingredients: ingredientiValidi,
      instructions: instructions.trim(),
      sourceType,
      customNotes: customNotes.trim() || undefined,
    };

    onSave(ricettaSalvata);
  };

  return (
    //dialoga con sectionBox.tsx, recipe.ts, cartella public e App.tsx
    <SectionBox
      title={
        isModifica
          ? `✏️ Modifica Ricetta: ${initialRecipe?.title}`
          : "Nuova Creazione di Laboratorio"
      }
      subtitle={
        isModifica
          ? "Aggiorna foto, ingredienti, unità di misura o procedimento."
          : "Aggiungi una nuova ricetta."
      }
      iconSrc="/Chef.jpg"
      onClose={onCancel}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-[#724c36] mb-1">
              Titolo Ricetta *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Risotto allo Zafferano, Sachertorte..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#dac6a3] bg-[#fffefb] text-sm focus:outline-none focus:ring-2 focus:ring-[#c25e00]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#724c36] mb-1">
              Categoria *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#dac6a3] bg-[#fffefb] text-sm focus:outline-none focus:ring-2 focus:ring-[#c25e00]"
            >
              {CATEGORIE_FORM.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#724c36] mb-1">
              Porzioni Base *
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-[#dac6a3] bg-[#fffefb] text-sm focus:outline-none focus:ring-2 focus:ring-[#c25e00]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
          <div>
            <label className="block text-xs font-bold text-[#724c36] mb-1">
              Cucina / Nazionalità (scrivi liberamente) *
            </label>
            <div className="flex items-center gap-2">
              <span
                className="text-xl px-2.5 py-1.5 rounded-xl bg-[#f3e4c8] border border-[#dac6a3]"
                title="Bandiera rilevata automaticamente"
              >
                {getCountryFlag(nationality)}
              </span>
              <input
                type="text"
                list="suggerimenti-cucine"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="Es. Italiana, Francese, Greca, Spagnola..."
                className="flex-1 px-3 py-2 rounded-xl border border-[#dac6a3] bg-[#fffefb] text-sm focus:outline-none focus:ring-2 focus:ring-[#c25e00]"
              />
            </div>
            <datalist id="suggerimenti-cucine">
              <option value="Italiana" />
              <option value="Austriaca" />
              <option value="Messicana" />
              <option value="Giapponese" />
              <option value="Francese" />
              <option value="Spagnola" />
              <option value="Greca" />
              <option value="Americana" />
              <option value="Cinese" />
              <option value="Indiana" />
              <option value="Thailandese" />
              <option value="Tedesca" />
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#724c36] mb-1">
              Origine Ricetta
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSourceType("personal")}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  sourceType === "personal"
                    ? "bg-[#faece4] text-[#803c25] border-[#c25e00]"
                    : "bg-[#fffefb] text-[#724c36] border-[#dac6a3]"
                }`}
              >
                👨‍🍳 Personale
              </button>
              <button
                type="button"
                onClick={() => setSourceType("web")}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  sourceType === "web"
                    ? "bg-[#eaf4f5] text-[#285f64] border-[#367d83]"
                    : "bg-[#fffefb] text-[#724c36] border-[#dac6a3]"
                }`}
              >
                🌐 Dal Web
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#724c36] mb-1">
              Foto del Piatto (URL o file dal PC)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Incolla URL https://... o carica file ->"
                className="flex-1 px-3 py-2 rounded-xl border border-[#dac6a3] bg-[#fffefb] text-xs focus:outline-none focus:ring-2 focus:ring-[#c25e00]"
              />
              <label className="px-3 py-2 rounded-xl bg-[#f3e4c8] hover:bg-[#e6d6b8] border border-[#dac6a3] text-xs font-bold text-[#2d140a] cursor-pointer shrink-0 flex items-center">
                📷 Scegli
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            {imageUrl && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={imageUrl}
                  alt="Anteprima"
                  className="w-12 h-12 rounded-lg object-cover border border-[#dac6a3]"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="text-xs text-[#c5221f] underline cursor-pointer"
                >
                  Rimuovi foto
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#faf3e6] border border-[#ebdcb9] rounded-2xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <img
                src="/recipe.jpg"
                alt="Icona Ingredienti"
                className="w-8 h-8 rounded-lg object-cover border border-[#dac6a3]"
              />
              <div>
                <h3 className="text-sm font-extrabold text-[#2d140a]">
                  Lista Ingredienti e Unità di Misura *
                </h3>
                <p className="text-xs text-[#724c36]">
                  Supporta qualsiasi unità (<code>g</code>, <code>dag</code>,{" "}
                  <code>kg</code>, <code>ml</code>, <code>cl</code>,{" "}
                  <code>dl</code>, <code>l</code>, <code>pz</code>...) o{" "}
                  <code>q.b.</code>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={aggiungiRigaIngrediente}
              className="px-3 py-1.5 rounded-xl bg-[#367d83] hover:bg-[#285f64] text-white text-xs font-bold cursor-pointer"
            >
              + Aggiungi Ingrediente
            </button>
          </div>

          <div className="space-y-2">
            {ingredients.map((ing, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-[#fffdf9] p-2.5 rounded-xl border border-[#e6d6b8]"
              >
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) =>
                      aggiornaIngrediente(index, "name", e.target.value)
                    }
                    placeholder="Nome ingrediente (es. Latte, Farina...)"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#dac6a3] bg-[#fffefb] text-xs focus:outline-none focus:ring-2 focus:ring-[#c25e00]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={ing.amount}
                    onChange={(e) =>
                      aggiornaIngrediente(index, "amount", e.target.value)
                    }
                    placeholder="Quantità (es. 250 o q.b.)"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#dac6a3] bg-[#fffefb] text-xs focus:outline-none focus:ring-2 focus:ring-[#c25e00]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="text"
                    list="unita-misura-list"
                    value={ing.unit}
                    onChange={(e) =>
                      aggiornaIngrediente(index, "unit", e.target.value)
                    }
                    placeholder="g, ml, dag..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#dac6a3] bg-[#fffefb] text-xs focus:outline-none focus:ring-2 focus:ring-[#c25e00]"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => impostaQb(index)}
                    title="Imposta questo ingrediente come Quanto Basta (q.b.)"
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                      String(ing.amount).toLowerCase() === "q.b."
                        ? "bg-[#c89628] text-white border-[#c89628]"
                        : "bg-[#fdf6e7] text-[#9e4b00] border-[#f4ddaa] hover:bg-[#f4ddaa]"
                    }`}
                  >
                    q.b.
                  </button>

                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => rimuoviRigaIngrediente(index)}
                      className="px-2 py-1 rounded-lg text-xs bg-[#fdf2f2] text-[#c5221f] border border-[#fca5a5] hover:bg-[#fca5a5]/40 cursor-pointer"
                      title="Rimuovi ingrediente"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <datalist id="unita-misura-list">
            {UNITA_MISURA.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#724c36] mb-1">
              👨‍🍳 Procedimento e Istruzioni *
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Descrivi i passaggi principali della preparazione..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#dac6a3] bg-[#fffefb] text-sm focus:outline-none focus:ring-2 focus:ring-[#c25e00]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#724c36] mb-1">
              🔬 Vai alla ricetta (facoltativo)
            </label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Annota varianti, consigli di cottura o sostituzioni..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#dac6a3] bg-[#fffefb] text-sm focus:outline-none focus:ring-2 focus:ring-[#c25e00]"
            />
          </div>
        </div>

        {errore && (
          <p className="text-xs font-semibold text-[#c5221f] bg-[#fdf2f2] border border-[#fca5a5] px-3.5 py-2.5 rounded-xl">
            ⚠️ {errore}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-[#f3e4c8] hover:bg-[#e6d6b8] text-[#2d140a] font-bold text-xs md:text-sm cursor-pointer"
          >
            Annulla
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#c25e00] hover:bg-[#9e4b00] text-white font-bold text-xs md:text-sm shadow-xs transition-colors cursor-pointer"
          >
            {isModifica ? "💾 Salva Modifiche" : "✨ Crea Ricetta"}
          </button>
        </div>
      </form>
    </SectionBox>
  );
}
