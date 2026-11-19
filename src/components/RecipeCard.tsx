import { useState } from "react";
import type { Recipe } from "../types/recipe";
import { getCountryFlag } from "../types/recipe";

interface RecipeCardProps {
  recipe: Recipe; //dati della ricetta
  isLabOpen: boolean; 
  onSelectLab: (id: string) => void; // callback per aprire il laboratorio dosi hce passa la f. al padre App.tsx
  onEdit: (recipe: Recipe) => void; // callback per aprire il form modifica ricetta
  onToggleFavorite: (id: string) => void; // callback per aggiornare il preferito
  onDelete: (id: string) => void; // callback per eliminare la ricetta
}

export default function RecipeCard({
  recipe,
  isLabOpen,
  onSelectLab,
  onEdit,
  onToggleFavorite,
  onDelete,
}: RecipeCardProps) {
  const [imgError, setImgError] = useState(false); //se l'immagine non viene trovata, mostra un messaggio di errore

  return (
    <article
      className={`flex flex-col justify-between bg-[#fffdf9] rounded-2xl border-2 transition-all overflow-hidden shadow-xs ${
        isLabOpen //controllo logico per cambiare stile al bottone se è open
          ? "border-[#367d83] ring-2 ring-[#367d83]/20"
          : "border-[#e6d6b8] hover:border-[#ad6c4c]"
      }`}
    >
      <div>
        <div className="relative h-44 bg-[#f3e4c8] overflow-hidden">
          {recipe.imageUrl && !imgError ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#724c36] gap-1.5">
              <img
                src="/Chef.jpg"
                alt="Chef TastyLab"
                className="w-16 h-16 rounded-full object-cover border-2 border-[#dac6a3] shadow-xs"
              />
              <span className="text-xs font-bold">Creazione TastyLab</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => onToggleFavorite(recipe.id)} 
            title={
              recipe.favorite
                ? "Rimuovi dai preferiti"
                : "Aggiungi ai preferiti"
            }
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#fffdf9]/95 shadow-sm flex items-center justify-center text-base hover:scale-105 transition-transform cursor-pointer"
          >
            {recipe.favorite ? "❤️" : "🤍"}
          </button>

          <span
            className={`absolute bottom-2.5 left-3 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs ${
              recipe.sourceType === "personal"
                ? "bg-[#faece4] text-[#803c25] border border-[#f2cbba]"
                : "bg-[#eaf4f5] text-[#285f64] border border-[#b5dcde]"
            }`}
          >
            {recipe.sourceType === "personal"
              ? "👨‍🍳 Ricetta Personale"
              : "🌐 Ricetta Web"}
          </span>
        </div>

        <div className="p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-bold px-2.5 py-0.5 rounded-md bg-[#f3e4c8] text-[#724c36]">
              {recipe.category}
            </span>
            <span className="font-semibold text-[#724c36]">
              {getCountryFlag(recipe.nationality)} {recipe.nationality}
            </span>
          </div>

          <h3 className="text-lg font-extrabold text-[#2d140a] leading-snug">
            {recipe.title}
          </h3>

          <p className="text-xs text-[#724c36]">
            🍽️ Porzioni base: <strong>{recipe.servings}</strong> •{" "}
            <strong>{recipe.ingredients.length}</strong> ingredienti
          </p>

          <p className="text-xs text-[#724c36] bg-[#faf3e6] border border-[#ebdcb9] rounded-xl p-2.5 line-clamp-2 italic">
            &ldquo;{recipe.customNotes ?? recipe.instructions}&rdquo;
          </p>
        </div>
      </div>

      <footer className="px-4 pb-4 pt-2 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onSelectLab(recipe.id)}
          className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
            isLabOpen
              ? "bg-[#285f64] text-white"
              : "bg-[#367d83] hover:bg-[#285f64] text-white"
          }`}
        >
          {isLabOpen ? "⚖️ Aperto" : "⚖️ Vai alla ricetta"} 
        </button>

        <button
          type="button"
          onClick={() => onEdit(recipe)}
          className="py-2 px-2.5 rounded-xl font-bold text-xs bg-[#f3e4c8] hover:bg-[#e6d6b8] text-[#2d140a] border border-[#dac6a3] transition-colors cursor-pointer"
          title="Modifica ricetta"
        >
          ✏️ Modifica
        </button>

        <button
          type="button"
          onClick={() => onDelete(recipe.id)}
          className="py-2 px-2.5 rounded-xl font-bold text-xs bg-[#fdf2f2] hover:bg-[#fca5a5]/40 text-[#c5221f] border border-[#fca5a5] transition-colors cursor-pointer"
          title="Elimina ricetta"
        >
          🗑️
        </button>
      </footer>
    </article>
  );
}
