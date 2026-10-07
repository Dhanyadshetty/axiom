const fs = require('fs');
const enPath = 'src/lib/i18n/en.ts';
const dePath = 'src/lib/i18n/de.ts';

let en = fs.readFileSync(enPath, 'utf8');
let de = fs.readFileSync(dePath, 'utf8');

const enTraceCatalog = `
    catalog: {
      openWorkspace: "Open Workspace",
      running: "Running...",
      adminRun: "Admin Run",
      run: "Run"
    },
    trace: {
      title: "Agent Execution Trace",
      runningNow: "RUNNING_NOW",
      workspaceIdle: "WORKSPACE_IDLE",
      runs24h: "RUNS_24H",
      noActivity: "No recent agent activity",
      noActivityDesc: "Wait for the scheduled dispatcher or launch an agent manually.",
      exec: "EXEC",
      payload: "PAYLOAD",
      state: "STATE"
    }
`;

const deTraceCatalog = `
    catalog: {
      openWorkspace: "Workspace öffnen",
      running: "Wird ausgeführt...",
      adminRun: "Admin-Ausführung",
      run: "Ausführen"
    },
    trace: {
      title: "Agentenausführungs-Trace",
      runningNow: "LÄUFT_JETZT",
      workspaceIdle: "WORKSPACE_LEERLAUF",
      runs24h: "LÄUFE_24H",
      noActivity: "Keine aktuelle Agentenaktivität",
      noActivityDesc: "Warten Sie auf den geplanten Dispatcher oder starten Sie manuell einen Agenten.",
      exec: "EXEC",
      payload: "NUTZLAST",
      state: "STATUS"
    }
`;

en = en.replace(/agentCatalog: "Agent Catalog"/, 'agentCatalog: "Agent Catalog",\\n' + enTraceCatalog);
de = de.replace(/agentCatalog: "Agenten-Katalog"/, 'agentCatalog: "Agenten-Katalog",\\n' + deTraceCatalog);

fs.writeFileSync(enPath, en);
fs.writeFileSync(dePath, de);
console.log('en.ts and de.ts updated');
