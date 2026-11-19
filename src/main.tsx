//importo la funzione che cra la radice del DOM, il foglio di stile e il componente principale 
import { createRoot } from "react-dom/client"; 
import "./styles/index.css";
import App from "./App.tsx"; 

// va a cerca l'elemento html root, cercandolo per id e lo salva nella costante rootElement
const rootElement = document.getElementById("root");

//se root non esiste, lancia un errore
if (!rootElement) {
  throw new Error("Elemento root non trovato");
}

// traduce l'elemento html root in un oggetto React e lo rende visibile
createRoot(rootElement).render(<App />);
