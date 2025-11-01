// Datei: public/widget.js
// VERSION 7 (Mit Demo-Modus, Farbwahl und Transparenz)

(function() {
  
  // --- HILFSFUNKTIONEN (Animation, CSS, etc.) ---

  function animateCountUp(elementId, endValue) {
    var element = document.getElementById(elementId);
    if (!element) return;
    if (endValue === 0) { // Nicht von 0 auf 0 animieren
      element.innerHTML = '0';
      return;
    }
    var startValue = 0;
    var duration = 2500;
    var startTime = null;
    function animationStep(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = timestamp - startTime;
      var easingProgress = progress / duration;
      var currentProgress = 1 - Math.pow(1 - easingProgress, 3);
      if (currentProgress > 1) currentProgress = 1;
      var currentValue = Math.floor(startValue + (endValue - startValue) * currentProgress);
      element.innerHTML = currentValue.toLocaleString('de-DE');
      if (progress < duration) requestAnimationFrame(animationStep);
      else element.innerHTML = endValue.toLocaleString('de-DE');
    }
    requestAnimationFrame(animationStep);
  }

  function animateFloatUp(elementId, valueString) {
    var element = document.getElementById(elementId);
    if (!element) return;
    var parts = valueString.split(' '); 
    var endValue = parseFloat(parts[0]);
    var unit = ' ' + (parts[1] || '');
    var decimalPlaces = (endValue % 1 === 0) ? 0 : 1; 
    if (endValue === 0) { // Nicht von 0 auf 0 animieren
      element.innerHTML = '0' + unit;
      return;
    }
    var startValue = 0;
    var duration = 2500;
    var startTime = null;
    function animationStep(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = timestamp - startTime;
      var easingProgress = progress / duration;
      var currentProgress = 1 - Math.pow(1 - easingProgress, 3);
      if (currentProgress > 1) currentProgress = 1;
      var currentValue = startValue + (endValue - startValue) * currentProgress;
      element.innerHTML = currentValue.toFixed(decimalPlaces) + unit;
      if (progress < duration) requestAnimationFrame(animationStep);
      else element.innerHTML = endValue.toFixed(decimalPlaces) + unit;
    }
    requestAnimationFrame(animationStep);
  }

  function loadCSS(domain) {
    var cssId = 'oto-impact-widget-css';
    if (document.getElementById(cssId)) return;
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.id = cssId;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = domain + '/widget.css';
    link.media = 'all';
    head.appendChild(link);
  }
  
  function createElement(tag, className) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    return el;
  }
  
  function createProgressBar(id, label, valueString, fillPercentage) {
    var item = createElement('div', 'progress-item');
    var unit = ' ' + (valueString.split(' ')[1] || '');
    var labelDiv = createElement('div', 'progress-label');
    labelDiv.innerHTML = '<span>' + label + '</span>' + 
                         '<span class="progress-value" id="' + id + '">0' + unit + '</span>';
    var barBg = createElement('div', 'progress-bar-background');
    var barFill = createElement('div', 'progress-bar-fill');
    setTimeout(function() {
      barFill.style.width = fillPercentage + '%';
    }, 100); 
    barBg.appendChild(barFill);
    item.appendChild(labelDiv);
    item.appendChild(barBg);
    return item;
  }

  // --- NEUE FUNKTION: BAUT DAS WIDGET-HTML ---
  // Diese Funktion wird jetzt von Demo-Modus und Live-Modus genutzt
  function buildWidget(container, domain, data, config) {
    container.innerHTML = ''; // Vorherigen Inhalt (Lade-Text) löschen
    
    var wrapper = createElement('div', 'oto-widget-wrapper');
    
    // --- Sektion 0: Große Überschrift ---
    var titleSection = createElement('div', 'oto-section oto-section-title');
    titleSection.innerHTML = '<h1 style="font-size: 48px; font-weight: bold; margin-bottom: 15px; text-align: left;">Otoscan® 🌱</h1>';
    
    // --- Sektion 1: Beschreibung ---
    var descSection = createElement('div', 'oto-section oto-section-description');
    descSection.innerHTML = '<p>Der Otoscan ist ein innovativer, optischer 3D-Scanner, der die Anatomie Ihres Gehörgangs erfasst – vollständig digital und ohne Abdruckmasse. Die Technologie wurde von Natus Medical Inc. entwickelt und ist die zukunftsweisende Alternative zur herkömmlichen Abdrucknahme mit Silikon und Mischkanülen aus Plastik.So haben wir nicht nur genaueste Scans Ihrer Ohren für perfekt sitzende maßgefertigte Produkte, sondern helfen mit jedem Scan unserer Umwelt.</p>';
    
    // --- Zwischenüberschrift 1 ---
    var headline1Section = createElement('div', 'oto-section');
    headline1Section.style.marginBottom = '10px'; 
    headline1Section.innerHTML = '<h2 style="font-size: 18px; font-weight: 600; text-align: left; margin: 0; opacity: 0.9;">Bis heute haben wir</h2>';

    // --- Sektion 2: Haupt-Counter ---
    var mainSection = createElement('div', 'oto-section oto-section-main');
    var imageDiv = createElement('div', 'oto-main-image');
    imageDiv.innerHTML = '<img src="' + domain + '/img/Otoscan_product_front_no-background.png" alt="Otoscan Gerät">';
    
    var counterDiv = createElement('div', 'oto-main-counter');
    counterDiv.innerHTML = '<p class="counter-number" id="oto-counter-number">0</p>' + 
                           '<p class="counter-label">digitale Ohrscans durchgeführt</p>';
    
    mainSection.appendChild(imageDiv);
    mainSection.appendChild(counterDiv);

    // --- Zwischenüberschrift 2 ---
    var headline2Section = createElement('div', 'oto-section');
    headline2Section.style.marginBottom = '10px';
    headline2Section.innerHTML = '<h2 style="font-size: 18px; font-weight: 600; text-align: left; margin: 0; opacity: 0.9;">und haben so</h2>';
    
    // --- Sektion 3: Ladebalken ---
    var progressSection = createElement('div', 'oto-section oto-section-progress-bars');
    
    // Wir übergeben die vollen Strings (z.B. "87.6 kg"),
    // die 'createProgressBar' Funktion setzt den Startwert auf "0 kg"
    progressSection.appendChild(
      createProgressBar('progress-plastic', 'Plastik gespart', data.plasticSavedInKg + ' kg', 85)
    );
    progressSection.appendChild(
      createProgressBar('progress-silicone', 'Silikon gespart', data.siliconeSavedInKg + ' kg', 70)
    );
    progressSection.appendChild(
      createProgressBar('progress-co2', 'CO2 eingespart', data.co2SavedInKg + ' kg', 90)
    );
    
    // --- Sektion 4: Banner ---
    var bannerSection = createElement('div', 'oto-section oto-section-banner');
    bannerSection.innerHTML = '<img src="' + domain + '/img/Envirement_background_01.jpg" alt="Nachhaltigkeits-Banner Wald">';
    
    // --- Sektion 5: Natus Logo ---
    var logoSection = createElement('div', 'oto-section oto-section-logo');
    logoSection.innerHTML = '<img src="' + domain + '/img/natus_sensory_logo_white.png" alt="Natus Logo">';
    
    // --- Alles zusammenbauen ---
    wrapper.appendChild(titleSection);
    wrapper.appendChild(descSection);
    //wrapper.appendChild(headline1Section);
    wrapper.appendChild(mainSection);
    //wrapper.appendChild(headline2Section);
    wrapper.appendChild(progressSection);
    wrapper.appendChild(bannerSection);
    wrapper.appendChild(logoSection);
    
    container.appendChild(wrapper);

    // --- NEU: DESIGN-ANPASSUNGEN ANWENDEN ---
    if (config.transparent === 'true') {
      wrapper.classList.add('transparent');
    }
    // Setzt die --widget-accent-color, die das CSS (Phase 1) jetzt nutzt
    wrapper.style.setProperty('--widget-accent-color', config.color);
    
    // --- Alle Animationen starten ---
    animateCountUp('oto-counter-number', data.totalScans);
    animateFloatUp('progress-plastic', data.plasticSavedInKg + ' kg');
    animateFloatUp('progress-silicone', data.siliconeSavedInKg + ' kg');
    animateFloatUp('progress-co2', data.co2SavedInKg + ' kg');
  }

  // --- NEUE FUNKTION: DATEN HOLEN ---
  function fetchLiveData(apiUrl, callback) {
    fetch(apiUrl)
      .then(function(response) {
        if (!response.ok) throw new Error('Netzwerkfehler');
        return response.json();
      })
      .then(function(data) {
        callback(data); // Daten an buildWidget übergeben
      })
      .catch(function(error) {
        console.error('OtoImpact Widget: Fehler beim Laden der Daten:', error);
        container.innerHTML = '<p style="color: red;">Widget konnte nicht geladen werden.</p>';
      });
  }

  // --- HAUPT-SKRIPT (DER NEUE "ROUTER") ---

  // 1. Finde Skript-Tag und Container
  var scriptTag = document.querySelector('script[src*="widget.js"]');
  var container = document.getElementById('oto-impact-counter');
  
  if (!container) {
    // Wenn der Kunde das <div id="..."> vergessen hat, tue nichts.
    console.error('OtoImpact Widget: Container <div id="oto-impact-counter"> nicht gefunden.');
    return; 
  }

  // 2. Lese Konfiguration aus dem Skript-Tag aus
  var config = {
    userId: scriptTag ? scriptTag.getAttribute('data-user-id') : null,
    color: scriptTag ? scriptTag.getAttribute('data-color') : '#ffffff', // Standard: Weiß
    transparent: scriptTag ? scriptTag.getAttribute('data-transparent') : 'false' // Standard: Nicht transparent
  };
  
  // 3. Finde die Domain, von der wir geladen wurden
  // Wichtig für Bild-Pfade und API-Aufruf
  var domain = 'https://oto-impact-counter.vercel.app'; // Standard-Produktions-URL
  if (scriptTag) {
    try {
      domain = new URL(scriptTag.src).origin;
    } catch (e) { /* Fällt auf Standard zurück */ }
  }
  
  // 4. Lade das CSS (immer)
  loadCSS(domain);

  // 5. ENTSCHEIDUNG: Demo- oder Live-Modus?
  if (!config.userId || config.userId === 'DEMO') {
    // --- DEMO-MODUS ---
    // (Wird auf der Landingpage genutzt)
    console.log('OtoImpact Widget: Starte im Demo-Modus.');
    
    var demoData = {
      totalScans: 0,
      plasticSavedInKg: "0.0",
      siliconeSavedInKg: "0.0",
      co2SavedInKg: "0"
    };
    
    // Baue das Widget sofort mit 0-Werten
    buildWidget(container, domain, demoData, config);
    
  } else {
    // --- LIVE-MODUS ---
    // (Wird auf der Kunden-Webseite genutzt)
    console.log('OtoImpact Widget: Starte im Live-Modus für User ' + config.userId);
    
    container.innerHTML = 'Lade Nachhaltigkeits-Daten...';
    var apiUrl = domain + '/api/widget/' + config.userId;
    
    // Hole echte Daten und baue dann das Widget
    fetchLiveData(apiUrl, function(liveData) {
      buildWidget(container, domain, liveData, config);
    });
  }

})();