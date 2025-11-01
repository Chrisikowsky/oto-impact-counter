// Datei: src/app/api/authenticate/route.ts
// VERSION 5 (Parst/Säubert den Cookie-String)

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const OTOCLOUD_LOGIN_URL = 'https://eur-prodapi.earscanning.com/api/Public/Users/Login';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'E-Mail und Passwort sind erforderlich.' }, { status: 400 });
    }

    const credentials = {
      Username: email,
      Password: password,
    };

    console.log(`[Backend] Versuche Login für ${email} bei Otocloud (via /Login)...`);

    const apiResponse = await fetch(OTOCLOUD_LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!apiResponse.ok) {
      console.error(`[Backend] Otocloud API Login Fehler: Status ${apiResponse.status}`);
      let errorData = { message: 'Keine Fehlerdetails vom Server.' };
      try {
        errorData = await apiResponse.json();
      } catch (e) {
        console.warn('[Backend] Konnte Fehler-Antwort nicht als JSON parsen. Body war vermutlich leer.');
      }
      console.error('[Backend] Otocloud API Login Fehlerdetails:', errorData);
      return NextResponse.json({ error: 'Login bei Otocloud fehlgeschlagen. Bitte Daten prüfen.' }, { status: 401 });
    }

    // --- KORRIGIERTE COOKIE-LOGIK ---

    // 1. Rohen Cookie-Header holen (wie bisher)
    const rawSessionCookie = apiResponse.headers.get('set-cookie');
    if (!rawSessionCookie) {
      console.error('[Backend] Login erfolgreich, aber kein Cookie empfangen.');
      return NextResponse.json({ error: 'Login erfolgreich, aber Cookie-Verarbeitung fehlgeschlagen.' }, { status: 500 });
    }

    // 2. NEU: Cookie "säubern"
    // Wir nehmen nur den Teil vor dem ersten Semikolon (z.B. "FedAuth=...").
    const sessionCookie = rawSessionCookie.split(';')[0];

    // Sicherheitscheck, ob das Parsen geklappt hat
    if (!sessionCookie || !(sessionCookie.includes('FedAuth=') || sessionCookie.includes('FedAuth_S='))) {
      console.error(`[Backend] Konnte Cookie nicht aus Header extrahieren: ${rawSessionCookie}`);
      return NextResponse.json({ error: 'Cookie-Verarbeitung fehlgeschlagen.' }, { status: 500 });
    }
    console.log(`[Backend] Erfolgreich GEPARSTEN Session-Cookie für ${email} erhalten.`);


    // 3. JSON-Body (User-Objekt) holen
    const userData = await apiResponse.json();
    
    // 4. clinicId aus dem 'EntityIds'-Array extrahieren
    if (!userData.EntityIds || !Array.isArray(userData.EntityIds) || userData.EntityIds.length === 0) {
      console.error(`[Backend] Login erfolgreich, aber 'EntityIds' nicht im User-Objekt gefunden oder ist leer.`);
      console.error('[Backend] Empfangenes User-Objekt:', userData);
      return NextResponse.json({ error: 'Login erfolgreich, aber ClinicId (EntityIds) konnte nicht verarbeitet werden.' }, { status: 500 });
    }
    const clinicId = userData.EntityIds[0]; 
    console.log(`[Backend] Erfolgreich ClinicId ${clinicId} (aus EntityIds) für ${email} erhalten.`);


    // --- DATENBANK-SPEICHERUNG (mit sauberem Cookie) ---
    console.log(`[Backend] Speichere SAUBEREN Cookie UND ClinicId für ${email} in der Datenbank...`);
    
    // Speichere das Ergebnis des Upserts in der 'user'-Variable
    const user = await prisma.user.upsert({
      where: { email: email },
      update: { 
        fedAuthCookie: sessionCookie,
        clinicId: clinicId,
      },
      create: {
        email: email,
        fedAuthCookie: sessionCookie,
        clinicId: clinicId,
      },
    });

    console.log(`[Backend] Daten erfolgreich in DB gespeichert für User-ID: ${user.id}`);
    
    return NextResponse.json({
      success: true,
      message: 'Erfolgreich verbunden!',
      userId: user.id // <-- WICHTIGE NEUE ZEILE
    });

  } catch (error) {
    console.error('[Backend] Interner Serverfehler:', error);
    return NextResponse.json({ error: 'Ein interner Serverfehler ist aufgetreten.' }, { status: 500 });
  }
}