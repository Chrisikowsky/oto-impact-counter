// Datei: src/app/api/authenticate/route.ts

import { NextResponse } from 'next/server';

// NEU: Das ist der korrekte Login-Endpunkt aus deiner Doku
const OTOCLOUD_LOGIN_URL = 'https://eur-prodapi.earscanning.com/api/Public/Users/Login';

export async function POST(request: Request) {
  try {
    // 1. Login-Daten aus dem Frontend empfangen (bleibt gleich)
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'E-Mail und Passwort sind erforderlich.' }, { status: 400 });
    }

    // NEU: Daten für die Otocloud API als JSON-Objekt vorbereiten
    const credentials = {
      Username: email, // Die Doku sagt "Username"
      Password: password,
    };

    console.log(`[Backend] Versuche Login für ${email} bei Otocloud (via /Login)...`);

    // 3. Anfrage an die Otocloud API senden
    const apiResponse = await fetch(OTOCLOUD_LOGIN_URL, {
      method: 'POST',
      headers: {
        // NEU: Die API erwartet JSON, kein Formular
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // NEU: Wir senden das JSON-Objekt als Text
      body: JSON.stringify(credentials), 
    });

    // 4. Antwort der API auswerten (bleibt fast gleich)
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error('[Backend] Otocloud API Login Fehler:', errorData);
      return NextResponse.json({ error: 'Login bei Otocloud fehlgeschlagen. Bitte Daten prüfen.' }, { status: 401 });
    }

    // 5. Erfolg! Das Cookie extrahieren
    
    // NEU: Wir erwarten ein Cookie, keinen JSON-Token
    const sessionCookie = apiResponse.headers.get('set-cookie');

    if (!sessionCookie) {
      // Das sollte nicht passieren, wenn der Login erfolgreich war
      console.error('[Backend] Login erfolgreich, aber kein Cookie empfangen.');
      return NextResponse.json({ error: 'Login erfolgreich, aber Cookie-Verarbeitung fehlgeschlagen.' }, { status: 500 });
    }

    // WICHTIG: Das Cookie enthält sensible Daten. 
    // Nur den Anfang loggen, um die Struktur zu sehen.
    console.log(`[Backend] Erfolgreich Session-Cookie für ${email} erhalten.`);
    console.log(`[Backend] Cookie (Anfang): ${sessionCookie.substring(0, 50)}...`);

    // --- ZUKÜNFTIGER SCHRITT: DATENBANK ---
    // HIER würden wir jetzt das 'sessionCookie' 
    // sicher und verschlüsselt in unserer Datenbank speichern.
    // ----------------------------------------

    // 6. Erfolgsmeldung an dein Frontend (bleibt gleich)
    return NextResponse.json({ 
      success: true, 
      message: 'Erfolgreich verbunden!' 
    });

  } catch (error) {
    console.error('[Backend] Interner Serverfehler:', error);
    return NextResponse.json({ error: 'Ein interner Serverfehler ist aufgetreten.' }, { status: 500 });
  }
}