import { useState, useEffect } from "react";
import type { Recipe } from "./types/recipe";
import { getCountryFlag } from "./types/recipe";
import RecipeCard from "./components/RecipeCard";
import RecipeForm from "./components/RecipeForm";
import PortionLab from "./components/PortionLab";

const CATEGORIE = [
  "Tutte",
  "Preferite ❤️",
  "Primo",
  "Secondo",
  "Dolce",
  "Piatto Unico",
] as const;

const STORAGE_KEY = "tastylab_recipes";

function leggiRicetteSalvate(): Recipe[] | null {
  try {
    const salvate = localStorage.getItem(STORAGE_KEY);
    if (!salvate) return null;
    const parsed = JSON.parse(salvate) as Recipe[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>(
    () => leggiRicetteSalvate() ?? [],
  );
  const [loading, setLoading] = useState<boolean>(
    () => leggiRicetteSalvate() === null,
  );
  const [error, setError] = useState<string | null>(null);

  const [ricerca, setRicerca] = useState<string>("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("Tutte");
  const [filtroCucina, setFiltroCucina] = useState<string>("Tutte");
  const [ricettaLabId, setRicettaLabId] = useState<string | null>(null);

  const [mostraForm, setMostraForm] = useState<boolean>(false);
  const [ricettaInModifica, setRicettaInModifica] = useState<Recipe | null>(
    null,
  );
  const [messaggioConferma, setMessaggioConferma] = useState<string | null>(
    null,
  );

 //scarica all'avvio le ricette dal json se non sono in memoria 
  useEffect(() => { 
    if (leggiRicetteSalvate() !== null) {
      return;
    }

    const controller = new AbortController();

    fetch("/recipes.json", { signal: controller.signal }) 
      .then((res) => { // quando il server risponde
        if (!res.ok) { //se non va a buon fine lancia errore
          throw new Error("Impossibile caricare il ricettario iniziale.");
        }
        return res.json(); //trasforma la risposta in json
      })
      .then((data: Recipe[]) => { //prende l'elenco delle ricette
        setRecipes(data); // le salva
        setLoading(false); // e interrompe il caricamento
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort(); // funzione di cleanup che interrompe il caricamento
  }, []);

  // salvataggio in local storage
  useEffect(() => {
    if (!loading && !error) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    }
  }, [recipes, loading, error]);

  const salvaRicetta = (ricettaSalvata: Recipe) => {
    const esisteGia = recipes.some((r) => r.id === ricettaSalvata.id);

    if (esisteGia) {
      setRecipes((prev) =>
        prev.map((r) => (r.id === ricettaSalvata.id ? ricettaSalvata : r)),
      );
      setMessaggioConferma(
        `Ricetta "${ricettaSalvata.title}" aggiornata e salvata!`,
      );
    } else {
      setRecipes((prev) => [ricettaSalvata, ...prev]);
      setMessaggioConferma(
        `Nuova ricetta "${ricettaSalvata.title}" aggiunta e salvata!`,
      );
    }

    setMostraForm(false);
    setRicettaInModifica(null);
  };

  const avviaNuovaRicetta = () => {
    setMessaggioConferma(null);
    if (mostraForm && !ricettaInModifica) {
      setMostraForm(false);
    } else {
      setRicettaInModifica(null);
      setMostraForm(true);
    }
  };

  const avviaModificaRicetta = (recipe: Recipe) => {
    setMessaggioConferma(null);
    setRicettaInModifica(recipe);
    setMostraForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const togglePreferito = (id: string) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, favorite: !r.favorite } : r)),
    );
  };

  const eliminaRicetta = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    if (ricettaLabId === id) {
      setRicettaLabId(null);
    }
    if (ricettaInModifica?.id === id) {
      setRicettaInModifica(null);
      setMostraForm(false);
    }
  };

  const toggleLaboratorio = (id: string) => {
    setRicettaLabId((prevId) => (prevId === id ? null : id));
  };
//filtra per cucine 
  const cucineDisponibili = [
    "Tutte",
    ...Array.from(new Set(recipes.map((r) => r.nationality))),
  ];

  const ricetteFiltrate = recipes.filter((r) => {
    const query = ricerca.toLowerCase().trim();
    const matchTesto =
      !query ||
      r.title.toLowerCase().includes(query) ||
      r.nationality.toLowerCase().includes(query) ||
      r.ingredients.some((ing) => ing.name.toLowerCase().includes(query));

    const matchCucina =
      filtroCucina === "Tutte" || r.nationality === filtroCucina;

    if (filtroCategoria === "Preferite ❤️") {
      return matchTesto && matchCucina && r.favorite;
    }
    if (filtroCategoria !== "Tutte") {
      return matchTesto && matchCucina && r.category === filtroCategoria;
    }
    return matchTesto && matchCucina;
  });

  const ricettaAttivaLab =
    recipes.find((r) => r.id === ricettaLabId) ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8ead0] text-[#2d140a]">
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-6">
        <header className="bg-[#fffdf9] border border-[#e6d6b8] rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-4">
            <img
              src="/Chef.jpg"
              alt="Chef TastyLab"
              className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover border-2 border-[#c25e00] shadow-xs shrink-0"
            />
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#2d140a]">
                Tasty<span className="text-[#c25e00]">Lab</span> — Ricettario
                &amp; Laboratorio di Cucina
              </h1>
              <p className="text-xs md:text-sm text-[#724c36] mt-0.5 max-w-2xl">
                Esplora le ricette,  modifica le dosi e crea le tue varianti culinarie.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={avviaNuovaRicetta}
            className="px-4 py-2.5 rounded-xl bg-[#c25e00] hover:bg-[#9e4b00] text-white font-bold text-xs md:text-sm shadow-xs transition-colors cursor-pointer shrink-0 self-end md:self-center"
          >
            {mostraForm && !ricettaInModifica
              ? "✕ Chiudi Form"
              : "+ Nuova Ricetta"}
          </button>
        </header>

        {messaggioConferma && (
          <div className="flex items-center justify-between bg-[#eaf5eb] border border-[#c3e6c7] text-[#286b36] px-4 py-3 rounded-xl text-xs md:text-sm font-bold">
            <span>✅ {messaggioConferma}</span>
            <button
              type="button"
              onClick={() => setMessaggioConferma(null)}
              className="text-xs underline ml-4 cursor-pointer"
            >
              Chiudi
            </button>
          </div>
        )}

        {mostraForm && (
          <RecipeForm
            key={ricettaInModifica?.id ?? "nuova-ricetta"}
            initialRecipe={ricettaInModifica}
            onSave={salvaRicetta}
            onCancel={() => {
              setMostraForm(false);
              setRicettaInModifica(null);
            }}
          />
        )}

        {ricettaAttivaLab && (
          <PortionLab
            key={`${ricettaAttivaLab.id}-${ricettaAttivaLab.servings}`}
            recipe={ricettaAttivaLab}
            onEdit={avviaModificaRicetta}
            onClose={() => setRicettaLabId(null)}
          />
        )}

        <section className="bg-[#fffdf9] border border-[#e6d6b8] rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
              placeholder="🔍 Cerca per titolo, cucina o ingrediente (es. Mascarpone, Sachertorte)..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-[#dac6a3] bg-[#fffefb] text-sm focus:outline-none focus:ring-2 focus:ring-[#367d83]"
            />

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#724c36] shrink-0">
                Cucina:
              </label>
              <select
                value={filtroCucina}
                onChange={(e) => setFiltroCucina(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#dac6a3] bg-[#fffefb] text-xs font-bold text-[#2d140a] focus:outline-none focus:ring-2 focus:ring-[#367d83]"
              >
                {cucineDisponibili.map((cucina) => (
                  <option key={cucina} value={cucina}>
                    {cucina === "Tutte"
                      ? "🌍 Tutte le cucine"
                      : `${getCountryFlag(cucina)} ${cucina}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIE.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFiltroCategoria(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    filtroCategoria === cat
                      ? "bg-[#367d83] text-white shadow-xs"
                      : "bg-[#f3e4c8] text-[#724c36] hover:bg-[#e6d6b8]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {(ricerca ||
              filtroCategoria !== "Tutte" ||
              filtroCucina !== "Tutte") && (
              <button
                type="button"
                onClick={() => {
                  setRicerca("");
                  setFiltroCategoria("Tutte");
                  setFiltroCucina("Tutte");
                }}
                className="text-xs font-bold text-[#c25e00] underline cursor-pointer"
              >
                ✕ Reset filtri
              </button>
            )}
          </div>
        </section>

        {loading && (
          <p className="text-center text-sm font-semibold text-[#367d83] py-10 animate-pulse">
            Caricamento ricette dal laboratorio in corso...
          </p>
        )}

        {error && (
          <div className="text-center bg-[#fdf2f2] border border-[#fca5a5] text-[#c5221f] p-6 rounded-2xl space-y-2">
            <p className="font-bold text-sm">⚠️ {error}</p>
            <p className="text-xs">
              Verifica che il file <code>public/recipes.json</code> sia
              presente.
            </p>
          </div>
        )}

        {!loading && !error && ricetteFiltrate.length === 0 && (
          <div className="text-center bg-[#fffdf9] border border-[#e6d6b8] p-8 rounded-2xl space-y-3">
            <p className="text-sm text-[#724c36] italic">
              🥣 Nessuna ricetta trovata con i filtri attuali.
            </p>
            <button
              type="button"
              onClick={() => {
                setRicerca("");
                setFiltroCategoria("Tutte");
                setFiltroCucina("Tutte");
              }}
              className="px-4 py-1.5 rounded-xl bg-[#f3e4c8] hover:bg-[#e6d6b8] text-xs font-bold text-[#2d140a] cursor-pointer"
            >
              Mostra tutte le ricette
            </button>
          </div>
        )}

        {!loading && !error && ricetteFiltrate.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ricetteFiltrate.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isLabOpen={ricettaLabId === recipe.id}
                onSelectLab={toggleLaboratorio}
                onEdit={avviaModificaRicetta}
                onToggleFavorite={togglePreferito}
                onDelete={eliminaRicetta}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-[#e6d6b8] bg-[#f3e4c8]/60 py-4 text-center text-xs text-[#724c36]">
        <strong>TastyLab</strong> — Progetto Finale React &amp; TypeScript
      </footer>
    </div>
  );
}
