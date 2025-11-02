// Datei: app/page.tsx
// VERSION 3.1 (Korrigierter Live-Editor)
'use client'; 

import { useState, useEffect } from 'react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export default function HomePage() {
  // States für Login, Lade/Fehler, Snippet (bleiben gleich)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedSnippet, setGeneratedSnippet] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // States für den Live-Editor (bleiben gleich)
  const [widgetColor, setWidgetColor] = useState('#ffffff');
  const [widgetTransparent, setWidgetTransparent] = useState(false);

  // --- NEU: Der EINE "Master-Hook" ---
  // Ersetzt die alten 3 Hooks.
  // Er läuft 1x beim Start UND jedes Mal, wenn sich Farbe, Transparenz oder Login-Status ändert.
  useEffect(() => {
    // 1. Finde und lösche immer das alte Skript, falls vorhanden
    const existingScript = document.getElementById('oto-widget-script');
    if (existingScript) {
      existingScript.remove();
    }
    
    // 2. Finde den Container und setze ihn zurück (wichtig für Demo-Modus)
    const container = document.getElementById('oto-impact-counter');
    if (container) {
      container.innerHTML = ''; // Leert das alte Widget, falls vorhanden
    }

    // 3. Erstelle immer ein neues Skript
    const script = document.createElement('script');
    script.id = 'oto-widget-script';
    script.src = '/widget.js'; // Lädt immer die gleiche Datei
    script.defer = true;

    // 4. Setze die Attribute basierend auf dem aktuellen Status
    
    // Setze User-ID (entweder DEMO oder die echte)
    script.setAttribute('data-user-id', currentUserId || 'DEMO'); 
    
    // Setze immer die aktuellen Design-Einstellungen
    script.setAttribute('data-color', widgetColor);
    script.setAttribute('data-transparent', String(widgetTransparent));

    // 5. Lade das Skript
    document.head.appendChild(script);

    // 6. Aufräumen, wenn die Seite verlassen wird
    return () => {
      const scriptToRemove = document.getElementById('oto-widget-script');
      if (scriptToRemove) scriptToRemove.remove();
    };
    
  }, [currentUserId, widgetColor, widgetTransparent]); // Abhängigkeiten: Läuft bei JEDER Änderung


  // --- Helfer-Funktion: Baut den Code-Schnipsel (bleibt gleich) ---
  const generateCodeSnippet = (userId: string) => {
    if (!APP_URL) {
      console.error("FEHLER: NEXT_PUBLIC_APP_URL ist nicht gesetzt.");
      setError("Konfigurationsfehler: App-URL nicht gefunden.");
      return;
    }
    
    const snippet = `<div id="oto-impact-counter"></div>
<script 
  src="${APP_URL}/widget.js" 
  data-user-id="${userId}"
  data-color="${widgetColor}"
  data-transparent="${widgetTransparent}"
  defer
></script>
`;
    
    setGeneratedSnippet(snippet);
  };

  // --- Submit-Funktion: Loggt den User ein (bleibt gleich) ---
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); 
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setGeneratedSnippet(null);
    setCurrentUserId(null);

    try {
      const response = await fetch('/api/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Etwas ist schiefgelaufen.');
      
      setSuccess(data.message || 'Erfolgreich verbunden!');
      setEmail('');
      setPassword('');

      if (data.userId) {
        setCurrentUserId(data.userId);  
        generateCodeSnippet(data.userId);
      } else {
        setError("Konnte User-ID nicht vom Server empfangen.");
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Ein unbekannter Fehler ist aufgetreten.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- NEUE HELFER-FUNKTION FÜR TRANSPARENZ ---
  const handleTransparencyChange = (isChecked: boolean) => {
    // 1. Setze Transparenz-Status
    setWidgetTransparent(isChecked);
    // 2. Setze die Farbe automatisch
    if (isChecked) {
      // WENN transparent AN, setze Farbe auf Dunkelgrau
      setWidgetColor('#293133'); 
    } else {
      // WENN transparent AUS, setze Farbe zurück auf Weiß
      setWidgetColor('#ffffff'); 
    }
  };

  // --- JSX: Das Layout (bleibt gleich) ---
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white py-8 px-8 md:px-8 rounded-lg shadow-md w-full max-w-6xl">
        
        <h1 className="text-4xl font-bold text-left mb-8 text-gray-800">
          OtoImpact counter
        </h1>

        {/* --- NEUER BESCHREIBUNGSBLOCK START --- */}
          <div className="mb-8 max-w-5xl">
            <p className="text-sm text-gray-700 mb-4">
              Zeigen Sie Ihren Kunden, dass Sie modern und nachhaltig arbeiten. Dieses Widget rechnet die Gesamtzahl Ihrer digitalen Otoscan-Abformungen live in eine sichtbare Umweltersparnis um.
            </p>
            <p className="text-sm text-gray-700 mb-4">
              Für Ihre Website-Besucher wird so auf einen Blick klar: Ihr Hörakustik Unternehmen ist modern, arbeitet abdruckfrei und hilft aktiv, Plastikmüll zu vermeiden. Das schafft Vertrauen und gibt Ihren Kunden ein gutes Gefühl bei ihrer Entscheidung.
            </p>
            <p className="text-sm text-gray-700 mb-4">
              Gestalten. Verbinden. Beeindrucken.
              Hier im Live-Editor können Sie Ihr persönliches Nachhaltigkeits-Widget gestalten. Passen Sie Farbe und Hintergrund so an, dass es perfekt zu Ihrer Marke passt.
              Sobald Sie mit dem Aussehen zufrieden sind, verbinden Sie sich einfach über "Widget aktivieren" sicher mit Ihrem Otocloud-Konto. Das Tool synchronisiert sich sofort mit Ihren echten Scandaten und erstellt Ihren persönlichen HTML-Code – bereit zum Kopieren und Einfügen auf Ihrer Website.
            </p>
          </div>
        {/* --- NEUER BESCHREIBUNGSBLOCK ENDE --- */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* --- LINKE SPALTE: Editor & Login/Snippet --- */}
          <div className="flex flex-col gap-6">
            
            {/* 1. Der Editor */}
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                1. Widget anpassen
              </h3>
              
              {/* Farbwähler (Text-Input) */}
              <div className="flex items-center justify-between mb-4">
                <label htmlFor="widgetColor" className="text-sm font-medium text-gray-700">
                  Akzentfarbe (HEX-Code)
                </label>
                <input
                  type="text"
                  id="widgetColor"
                  value={widgetColor} // Der State ist bereits "#ffffff"
                  onChange={(e) => setWidgetColor(e.target.value)} // Der User tippt den HEX-Code inkl. #
                  className="w-28 px-3 py-2 border border-gray-300 rounded-md text-black"
                  placeholder="#ffffff"
                  maxLength={7} // # + 6 Zeichen
                />
              </div>
              
              {/* Transparenz-Schalter */}
              <div className="flex items-center justify-between">
                <label htmlFor="widgetTransparent" className="text-sm font-medium text-gray-700">
                  Hintergrund transparent
                </label>
                <input
                  type="checkbox"
                  id="widgetTransparent"
                  checked={widgetTransparent}
                  onChange={(e) => handleTransparencyChange(e.target.checked)} /* <-- HIER GEÄNDERT */
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 2. Login- oder Snippet-Block */}
            {generatedSnippet ? (
              // NACH DEM LOGIN: Zeige den Schnipsel
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  3. Ihr Code-Schnipsel
                </h3>
                <p className="text-sm text-green-700 mb-4">{success}</p>
                <p className="text-sm text-gray-700 mb-2">
                  Kopieren Sie diesen Code und fügen Sie ihn auf Ihrer Webseite ein:
                </p>
                <textarea
                  readOnly
                  value={generatedSnippet}
                  className="w-full h-40 p-2 border border-gray-300 rounded-md font-mono text-sm text-gray-800 bg-gray-50"
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
                <button
                  onClick={() => {
                    setGeneratedSnippet(null);
                    setCurrentUserId(null); // Löst Hook aus, um Demo neu zu laden
                    setSuccess(null);
                  }}
                  className="w-full mt-4 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                >
                  Anderes Konto verbinden
                </button>
              </div>
            ) : (
              // VOR DEM LOGIN: Zeige das Login-Formular
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  2. Widget aktivieren
                </h3>
                <p className="text-center text-gray-600 mb-6 text-sm">
                  Verbinden Sie Ihr Otocloud-Konto, um Ihre echten Daten anzuzeigen.
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Otocloud E-Mail</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md text-black" disabled={isLoading} />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Otocloud Passwort</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md text-black" disabled={isLoading} />
                  </div>
                  {error && (<div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>)}
                  <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md disabled:opacity-50" disabled={isLoading}>
                    {isLoading ? 'Verbinde...' : 'Sicher verbinden & Code generieren'}
                  </button>
                </form>
              </div>
            )}
            
          </div>

          {/* --- RECHTE SPALTE: Live-Vorschau --- */}
          <div className="py-4 px-0 md:p-4 border border-gray-200 rounded-lg bg-gray-50 md:col-span-2">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-left">
              Live-Vorschau
            </h3>
            <div id="oto-impact-counter"></div>
          </div>
          
        </div>
        {/* --- NEUER COPYRIGHT-BLOCK START --- */}
  <div className="w-full max-w-6xl mt-4">
    <p className="text-xs text-gray-500">
      Ein Tool von Christoph Schulte © {new Date().getFullYear()}
    </p>
  </div>
  {/* --- NEUER COPYRIGHT-BLOCK ENDE --- */}
      </div>
    </main>
  );
}