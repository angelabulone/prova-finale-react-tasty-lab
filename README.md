# 🍳 TastyLab — Ricettario & Laboratorio Dosi (React + TypeScript)

**TastyLab** è una Single-Page Application (SPA) realizzata con **React 19**, **TypeScript**, **Tailwind CSS v4** e **Vite**.  
Il progetto combina la consultazione di un ricettario interattivo con un **Laboratorio Dosi**, che ricalcola istantaneamente le quantità degli ingredienti in proporzione alle porzioni desiderate.

---

## 📌 Funzionalità Reali del Progetto

### 1. Catalogo Ricette e Data Fetching
- **Caricamento iniziale asincrono:** All'avvio dell'applicazione, se il `localStorage` è vuoto, i dati iniziali vengono recuperati dal file `/recipes.json` tramite `fetch()` gestita all'interno di un hook `useEffect` con pulizia tramite `AbortController`.
- **Persistenza in `localStorage`:** Tutte le modifiche (aggiunta di nuove ricette, modifiche a quelle esistenti, eliminazioni e contrassegno dei preferiti ❤️) vengono salvate automaticamente e persistono alla chiusura o al ricaricamento del browser (chiave `tastylab_recipes`).

### 2. Ricerca e Filtri Disponibili
Nell'applicazione sono presenti esclusivamente i seguenti **3 strumenti di filtro in tempo reale**:
1. **Ricerca testuale reattiva:** Un campo di testo (`<input>`) che filtra istantaneamente confrontando il testo inserito con:
   - Il **titolo** della ricetta.
   - La **cucina / nazionalità**.
   - I singoli **ingredienti** (es. cercando *"mascarpone"* o *"cipolla"*).
2. **Filtro Categoria a pulsanti:** Pulsanti rapidi per visualizzare:
   - *Tutte*
   - *Preferite ❤️* (filtra le ricette contrassegnate come preferite)
   - *Primo*
   - *Secondo*
   - *Dolce*
   - *Piatto Unico*
3. **Filtro Cucina / Nazionalità a tendina:** Menu a tendina (`<select>`) generato dinamicamente estraendo le sole cucine presenti nelle ricette attuali (`new Set()`).
4. **Pulsante "✕ Reset filtri":** Appare in modo condizionale solo quando almeno un filtro è attivo, consentendo di ripristinare la vista completa con un clic.

> **Nota di chiarezza sui filtri:**  
> L'applicazione **non** include filtri per difficoltà o per calorie. La difficoltà (*Facile*, *Media*, *Difficile*) è un dato descrittivo inserito nella scheda e nel form della ricetta, mentre i filtri attivi sono unicamente quelli descritti sopra (ricerca testuale, categoria/preferiti e cucina).

### 3. ⚖️ Laboratorio Dosi (PortionLab)
- **Ricalcolo matematico proporzionale:** Cliccando su *"⚖️ Laboratorio Dosi"* in una card, si apre una sezione interattiva in cui è possibile variare il numero di porzioni desiderate con i pulsanti `+` e `−`.
- **Formula applicata:** `(doseOriginale / porzioniOriginali) * porzioniSelezionate`.
- **Supporto unità di misura e decimali:** Scala correttamente valori interi e decimali (anche con virgola) associati a unità quali `g`, `dag`, `ml`, `pz`, `cucchiai`, ecc.
- **Gestione "q.b." (quanto basta):** Le dosi non numeriche o a discrezione personale vengono riconosciute ed evidenziate con un badge dedicato, evitando calcoli errati (`NaN`).
- **Nessuna modifica accidentale:** Il ricalcolo è gestito con uno stato locale (`useState`) all'interno del laboratorio; la ricetta salvata non viene alterata.
- **Pulsante rapido di modifica:** Dalla schermata del laboratorio è possibile cliccare *"✏️ Modifica questa ricetta"* per aprire direttamente il form di modifica.

### 4. ✏️ Creazione e Modifica Ricette (RecipeForm)
- **Componente Controllato Riutilizzabile:** Un unico form controllato gestisce sia la creazione di una nuova ricetta che la modifica di una esistente (`initialRecipe`).
- **Campi gestiti con validazione:** Titolo, descrizione sintetica, categoria, tempo di preparazione (min), porzioni base, livello di difficoltà (*Facile*, *Media*, *Difficile*), cucina/nazionalità, origine (*Personale* vs *Web*), ingredienti e procedimento.
- **Riconoscimento automatico della bandiera:** Digitando la nazionalità (es. *Italiana*, *Messicana*, *Giapponese*), viene associata automaticamente l'emoji della bandiera corrispondente tramite la funzione `getCountryFlag`.
- **Caricamento Immagine Ibrido:**
  - Inserimento diretto di un URL web (HTTPS).
  - Oppure caricamento di un file immagine dal computer, convertito in stringa **Base64** tramite l'API standard `FileReader` per consentire il salvataggio diretto nel `localStorage`.
- **Gestione dinamica degli ingredienti:** Possibilità di aggiungere e rimuovere righe di ingredienti, definendo nome, dose numerica, unità di misura oppure selezionando la scorciatoia *"q.b."*.

### 5. 🃏 Card della Ricetta (RecipeCard)
- Visualizzazione dell'immagine con fallback automatico all'avatar dello Chef se la foto non è presente o non è valida.
- Badge identificativo di categoria, cucina con bandiera ed etichetta di origine (*Ricetta Personale* o *Ricetta Web*).
- Pulsante rapido con icona a cuore per impostare/rimuovere lo stato di **Preferita ❤️**.
- Pulsanti di azione: *"⚖️ Laboratorio Dosi"*, *"✏️ Modifica"* ed *"🗑️ Elimina"* (con richiesta di conferma).

---

## 🏗️ Architettura del Codice e Concetti React

Il progetto è strutturato seguendo le buone pratiche di React e i requisiti d'esame:

1. **Componentizzazione e Composizione (`children`):**
   - Interfaccia suddivisa in componenti modulari con responsabilità singola: `App`, `RecipeCard`, `PortionLab`, `RecipeForm`.
   - Il componente `SectionBox` sfrutta la prop speciale `children: ReactNode` per fare da contenitore grafico coerente e riutilizzabile.
2. **Stato Condiviso e Flusso Unidirezionale:**
   - Lo stato principale risiede nel componente genitore `App.tsx` (Single Source of Truth).
   - I componenti figli ricevono i dati tramite `props` e comunicano con il genitore esclusivamente tramite funzioni di callback (`onSave`, `onEdit`, `onDelete`, `onToggleFavorite`, `onSelectLab`).
3. **Immutabilità dello Stato:**
   - Tutti gli aggiornamenti di stato per array e oggetti avvengono in modo immutabile utilizzando la forma funzionale di `setRecipes((prev) => ...)` combinata con lo spread operator `[...prev]`, `.map()` e `.filter()`.
4. **Stato Derivato (Derived State):**
   - Le ricette visibili (`ricetteFiltrate`), l'elenco delle nazionalità uniche (`cucineDisponibili`) e la ricetta aperta nel laboratorio (`ricettaAttivaLab`) sono calcolate direttamente a ogni render senza duplicare dati in variabili `useState` aggiuntive.
5. **Reset dello stato tramite prop `key`:**
   - `RecipeForm` riceve come prop `key` l'ID della ricetta in modifica (oppure una stringa fissa per la nuova ricetta), garantendo che React ricrei l'istanza del form azzerando gli input quando si cambia ricetta.

---

## 📁 Struttura della Cartella `src/`

```text
src/
├── App.tsx                  # Componente radice: stato globale, filtri, fetch, localStorage
├── main.tsx                 # Entry point di React con createRoot e StrictMode
├── types/
│   └── recipe.ts            # Tipi TypeScript (Recipe, Ingredient), formattaDoseScalata e getCountryFlag
├── components/
│   ├── RecipeCard.tsx       # Card presentazionale per la singola ricetta
│   ├── PortionLab.tsx       # Laboratorio interattivo ricalcolo porzioni e dosi
│   ├── RecipeForm.tsx       # Form controllato per aggiunta e modifica ricetta
│   └── SectionBox.tsx       # Contenitore riutilizzabile con children e pulsante chiusura
└── styles/
    └── index.css            # Direttiva @import "tailwindcss"
```

---

## 🚀 Istruzioni per l'Esecuzione

### 1. Installazione delle dipendenze
```bash
npm install
```

### 2. Avvio in modalità sviluppo
```bash
npm run dev
```
L'applicazione sarà attiva all'indirizzo locale indicato nel terminale (di default `http://localhost:5173`).

### 3. Verifica del codice con il Linter
```bash
npm run lint
```

### 4. Compilazione per la produzione (Build)
```bash
npm run build
```
I file ottimizzati verranno generati nella cartella `dist/`.
