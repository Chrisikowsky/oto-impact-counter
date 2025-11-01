// Datei: src/app/page.tsx
'use client'; 

import { useState } from 'react';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // NEU: States für Lade-Feedback und Fehlermeldungen
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); 
    
    // NEU: Setze den Ladezustand und lösche alte Nachrichten
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // NEU: Sende die Daten an unser eigenes Backend (/api/authenticate)
      const response = await fetch('/api/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Wenn die API einen Fehler zurückgibt (z.B. 401 Falsches Passwort)
        throw new Error(data.error || 'Etwas ist schiefgelaufen.');
      }
      
      // Erfolg!
      setSuccess(data.message || 'Erfolgreich verbunden!');
      setEmail(''); // Formularfelder leeren
      setPassword(''); // Formularfelder leeren

    } catch (err) {
      // Fehler beim fetch oder von der API
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ein unbekannter Fehler ist aufgetreten.');
      }
    } finally {
      // NEU: Ladezustand beenden, egal ob Erfolg oder Fehler
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          OtoImpact Counter
        </h1>
        
        <p className="text-center text-gray-600 mb-6">
          Verbinden Sie Ihr Otocloud-Konto, um Ihr persönliches Widget zu generieren.
        </p>

        {/* Das Formular bleibt fast gleich */}
        <form onSubmit={handleSubmit}>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Otocloud E-Mail
            </label>
            <input
              type="email"
              id="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
              disabled={isLoading} // NEU: Deaktivieren während des Ladens
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Otocloud Passwort
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
              disabled={isLoading} // NEU: Deaktivieren während des Ladens
            />
          </div>

          {/* NEU: Erfolgs- und Fehlermeldungen anzeigen */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading} // NEU: Deaktivieren während des Ladens
          >
            {/* NEU: Text ändern, während geladen wird */}
            {isLoading ? 'Verbinde...' : 'Sicher verbinden'}
          </button>
          
        </form>
      </div>
    </main>
  );
}