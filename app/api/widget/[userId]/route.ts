// Datei: app/api/widget/[userId]/route.ts
// FINALE VERSION (mit "kugelsicherer" Variablendeklaration)

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const CACHE_DURATION_HOURS = 12;

function getOtocloudScansUrl(clinicId: string) {
  return `https://eur-prodapi.earscanning.com/api/Clinics/${clinicId}/Scans`;
}

// --- HELPER-FUNKTION (bleibt gleich) ---
async function fetchNewScanCount(userId: string, clinicId: string, fedAuthCookie: string) {
  console.log(`[Cache-Miss] Rufe ECHTE Otocloud-Scans für ClinicId ${clinicId} ab...`);
  const otocloudApiUrl = getOtocloudScansUrl(clinicId);
  let scanCount = 0;

  try {
    const otocloudResponse = await fetch(otocloudApiUrl, {
      method: 'GET',
      headers: { 'Cookie': fedAuthCookie, 'Accept': 'application/json' }
    });

    if (otocloudResponse.ok) {
      const scanData = await otocloudResponse.json();
      scanCount = Array.isArray(scanData) ? scanData.length : 0;
      console.log(`[Cache-Miss] ECHTE Anzahl Scans empfangen: ${scanCount}`);
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          cachedScanCount: scanCount,
          scansLastCheckedAt: new Date(),
        },
      });
      console.log(`[Cache-Miss] Neuen Zähler (${scanCount}) in DB gespeichert.`);
    } else {
      console.error(`[Cache-Miss] Otocloud-Abruf fehlgeschlagen: Status ${otocloudResponse.status}`);
      // Bei Fehler: Nimm den alten Cache-Wert, falls vorhanden, sonst 0
      const oldUser = await prisma.user.findUnique({ where: { id: userId } });
      scanCount = oldUser?.cachedScanCount ?? 0;
    }
  } catch (e) {
    console.error(`[Cache-Miss] Kritischer Fehler beim Abruf von Otocloud-Scans:`, e);
    // Bei Fehler: Nimm den alten Cache-Wert, falls vorhanden, sonst 0
    const oldUser = await prisma.user.findUnique({ where: { id: userId } });
    scanCount = oldUser?.cachedScanCount ?? 0;
  }
  return scanCount;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const userId = pathSegments[pathSegments.length - 1];

    if (!userId || userId === '[userId]') {
      return NextResponse.json({ error: 'Benutzer-ID fehlt oder ist ungültig' }, { 
        status: 400, headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { 
        status: 404, headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    // --- NEU: "Kugelsichere" Variablendeklaration ---
    // Wir deklarieren ALLE Variablen hier oben.
    let scanCount = 0;
    let plasticSavedInKg = "0.0";
    let siliconeSavedInKg = "0.0";
    let co2SavedInKg = "0";
    // --- ENDE NEU ---

    // --- CACHING-LOGIK START ---
    const cacheAgeLimit = new Date();
    cacheAgeLimit.setHours(cacheAgeLimit.getHours() - CACHE_DURATION_HOURS);

    if (user.cachedScanCount !== null && user.scansLastCheckedAt && user.scansLastCheckedAt > cacheAgeLimit) {
      console.log(`[Cache-Hit] Verwende schnelle Zahl aus Cache: ${user.cachedScanCount}`);
      scanCount = user.cachedScanCount;
    } else {
      console.log(`[Cache-Miss] Cache ist alt oder leer. Starte langsamen Abruf...`);
      scanCount = await fetchNewScanCount(user.id, user.clinicId, user.fedAuthCookie);
    }
    // --- CACHING-LOGIK ENDE ---

    
    // --- 4. BERECHNUNGEN (bleibt an dieser Position) ---
    // Wir weisen den oben deklarierten 'let'-Variablen jetzt Werte zu.
    
    plasticSavedInKg = (scanCount * 8.50 / 1000).toFixed(1);
    siliconeSavedInKg = (scanCount * 10 / 1000).toFixed(1);
    co2SavedInKg = (scanCount * 0.12).toFixed(1);


    console.log(`[Widget API] Sende finale Daten für User ${user.email}: ${scanCount} Scans`);

    // --- 5. DATENRÜCKGABE (bleibt gleich) ---
    return NextResponse.json({
      totalScans: scanCount,
      plasticSavedInKg: plasticSavedInKg, // Sollte jetzt 100% definiert sein
      siliconeSavedInKg: siliconeSavedInKg,
      co2SavedInKg: co2SavedInKg
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });

  } catch (error) {
    console.error('[Widget API] Interner Fehler:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { 
      status: 500, headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}