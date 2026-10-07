const fs = require('fs');
let en = fs.readFileSync('src/lib/i18n/en.ts', 'utf8');
let de = fs.readFileSync('src/lib/i18n/de.ts', 'utf8');

const enKeys = `  operationalFreshness: {
    dataLastSynced: "Data last synced",
    thisSurfaceRenders: "This surface renders from guarded server actions. Force refresh if you need a fresh read before presenting.",
    liveRoute: "Live route",
    degradedPosture: "Degraded / cached posture",
    autoRefreshPaused: "Auto-refresh paused on weak or offline connection",
    forceRefresh: "Force Refresh",
    unknownAge: "Unknown age",
    ago: "{time} ago",

    telemetry: {
      offline: {
        title: "Telemetry heartbeat offline",
        detail: "No recent telemetry heartbeat is available, so watch coverage should be treated as incomplete."
      },
      stale: {
        title: "Telemetry heartbeat stale",
        detail: "Last signal {age}. Review telemetry before trusting coverage claims."
      },
      live: {
        title: "Telemetry heartbeat live",
        detail: "Last signal {age} across the monitored routes."
      }
    },
    fxRates: {
      missing: {
        title: "FX rates missing",
        detail: "Reporting-book rates are not loaded yet, so global rollups should stay in source currency views."
      },
      stale: {
        title: "FX rates need refresh",
        detail: "Last rates update {age}. Refresh book rates before relying on global spend totals."
      },
      staleNoDate: {
        title: "FX rates need refresh",
        detail: "FX updates are not timestamped yet."
      },
      fresh: {
        title: "FX rates loaded",
        detail: "Reporting-book rates refreshed {age}."
      }
    }
  },
`;

const deKeys = `  operationalFreshness: {
    dataLastSynced: "Zuletzt synchronisiert",
    thisSurfaceRenders: "Diese Oberfläche wird aus geschützten Serveraktionen gerendert. Erzwingen Sie eine Aktualisierung, wenn Sie vor der Präsentation einen neuen Lesevorgang benötigen.",
    liveRoute: "Live-Route",
    degradedPosture: "Eingeschränkter / zwischengespeicherter Status",
    autoRefreshPaused: "Automatische Aktualisierung bei schwacher oder Offline-Verbindung pausiert",
    forceRefresh: "Aktualisieren erzwingen",
    unknownAge: "Unbekanntes Alter",
    ago: "vor {time}",

    telemetry: {
      offline: {
        title: "Telemetrie-Heartbeat offline",
        detail: "Es ist kein aktueller Telemetrie-Heartbeat verfügbar, daher sollte die Überwachungsabdeckung als unvollständig betrachtet werden."
      },
      stale: {
        title: "Telemetrie-Heartbeat veraltet",
        detail: "Letztes Signal {age}. Überprüfen Sie die Telemetrie, bevor Sie auf Abdeckungsbehauptungen vertrauen."
      },
      live: {
        title: "Telemetrie-Heartbeat live",
        detail: "Letztes Signal {age} über die überwachten Routen."
      }
    },
    fxRates: {
      missing: {
        title: "Wechselkurse fehlen",
        detail: "Reporting-Book-Kurse sind noch nicht geladen, daher sollten globale Rollups in der Quellwährungsansicht bleiben."
      },
      stale: {
        title: "Wechselkurse müssen aktualisiert werden",
        detail: "Letzte Kursaktualisierung {age}. Aktualisieren Sie die Buchkurse, bevor Sie sich auf globale Ausgabensummen verlassen."
      },
      staleNoDate: {
        title: "Wechselkurse müssen aktualisiert werden",
        detail: "FX-Updates sind noch nicht mit einem Zeitstempel versehen."
      },
      fresh: {
        title: "Wechselkurse geladen",
        detail: "Reporting-Book-Kurse {age} aktualisiert."
      }
    }
  },
`;

en = en.replace(/}\s+as const;/, enKeys + '} as const;');
de = de.replace(/}\s+as const;/, deKeys + '} as const;');

fs.writeFileSync('src/lib/i18n/en.ts', en);
fs.writeFileSync('src/lib/i18n/de.ts', de);
console.log('Added operationalFreshness to en.ts and de.ts');
