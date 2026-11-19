import { useState } from "react";
import type { Recipe } from "../types/recipe";
import { formattaDoseScalata, getCountryFlag } from "../types/recipe";
import SectionBox from "./SectionBox";

interface PortionLabProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onClose: () => void;
}

export default function PortionLab({
  recipe,
  onEdit,
  onClose,
}: PortionLabProps) {
  // inizializza lo stato iniziale delle porzioni della ricetta
  const [porzioni, setPorzioni] = useState<number>(recipe.servings);

  const diminuisci = () => {
    setPorzioni((p) => (p > 1 ? p - 1 : 1)); //se il n. di porzioni è > 1, diminuisce di 1 altrimenti rimane a 1
  };

  const aumenta = () => {
    setPorzioni((p) => p + 1);
  };

  return (
    <SectionBox
      title={`Laboratorio Dosi: ${recipe.title}`}
      subtitle={`${getCountryFlag(recipe.nationality)} Cucina ${recipe.nationality} • Categoria: ${recipe.category}`}
      iconSrc="/recipe.jpg"
      onClose={onClose}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Colonna 1: Controllo Porzioni e Lista Ingredienti ricalcolata */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f3e4c8] p-3.5 rounded-xl border border-[#dac6a3]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#724c36] block">
                Porzioni da preparare
              </span>
              <span className="text-xs text-[#724c36]">
                (Dosi base calibrate per <strong>{recipe.servings}</strong>{" "}
                {recipe.servings === 1 ? "persona" : "persone"})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={diminuisci}
                disabled={porzioni <= 1}
                className="w-8 h-8 rounded-lg bg-[#fffdf9] border border-[#dac6a3] font-bold text-[#2d140a] hover:bg-[#e6d6b8] disabled:opacity-40 cursor-pointer"
              >
                −
              </button>
              <span className="min-w-8 text-center font-black text-lg text-[#c25e00]">
                {porzioni}
              </span>
              <button
                type="button"
                onClick={aumenta}
                className="w-8 h-8 rounded-lg bg-[#fffdf9] border border-[#dac6a3] font-bold text-[#2d140a] hover:bg-[#e6d6b8] cursor-pointer"
              >
                +
              </button>

              {porzioni !== recipe.servings && (
                <button
                  type="button"
                  onClick={() => setPorzioni(recipe.servings)}
                  className="ml-1 text-xs underline text-[#367d83] font-semibold cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Lista ingredienti generata con .map() (Slide 16) */}
          <ul className="space-y-1.5">
            {recipe.ingredients.map((ing, index) => {
              const dose = formattaDoseScalata(
                ing.amount,
                ing.unit,
                recipe.servings,
                porzioni,
              );

              return (
                <li
                  key={`${ing.name}-${index}`}
                  className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-[#faf3e6] border border-[#ebdcb9]"
                >
                  <span className="font-medium text-[#2d140a]">{ing.name}</span>

                  {dose.isQb ? (
                    <span className="text-xs font-bold italic px-2.5 py-0.5 rounded-md bg-[#fdf6e7] text-[#9e4b00] border border-[#f4ddaa]">
                      {dose.testo}
                    </span>
                  ) : (
                    <span className="font-bold text-[#367d83]">
                      {dose.testo}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Colonna 2: Immagine, Procedimento, Note e Tasto Modifica */}
        <div className="space-y-4 flex flex-col justify-between bg-[#faf3e6] p-4 rounded-xl border border-[#ebdcb9]">
          <div className="space-y-3">
            {recipe.imageUrl && (
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-40 object-cover rounded-xl border border-[#dac6a3]"
              />
            )}

            <h3 className="text-sm font-bold text-[#2d140a]">
              👨‍🍳 Procedimento e Istruzioni
            </h3>
            <p className="text-sm text-[#724c36] leading-relaxed whitespace-pre-line">
              {recipe.instructions}
            </p>

            {recipe.customNotes && (
              <div className="p-3 rounded-lg bg-[#eaf4f5] border border-[#b5dcde] text-xs text-[#285f64]">
                <strong>🔬 Nota di Laboratorio:</strong> {recipe.customNotes}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#ebdcb9] flex justify-end">
            <button
              type="button"
              onClick={() => onEdit(recipe)}
              className="px-4 py-2 rounded-xl bg-[#f3e4c8] hover:bg-[#e6d6b8] text-[#2d140a] border border-[#dac6a3] font-bold text-xs transition-colors cursor-pointer"
            >
              ✏️ Modifica questa ricetta
            </button>
          </div>
        </div>
      </div>
    </SectionBox>
  );
}
