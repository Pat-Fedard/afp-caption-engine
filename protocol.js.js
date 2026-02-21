// AFP Protocol v8.11 - Règles du protocole
const AFP_PROTOCOL = {
    version: "8.11",
    
    // Commandes disponibles
    commands: {
        on: { syntax: "on [date]", desc: "Activer session" },
        off: { syntax: "off", desc: "Désactiver session" },
        "sport on": { syntax: "sport on", desc: "Activer mode sports" },
        template: { syntax: "template", desc: "Activer mode template" },
        out: { syntax: "out", desc: "Sortir du mode" },
        check: { syntax: "check", desc: "Rechercher contexte" },
        "2": { syntax: "2 [texte]", desc: "Traduction brute" }
    },
    
    // Checklist générale (13 points)
    general_checklist: [
        "PERSONNES: Qualité AVANT le nom pour chaque personne",
        "ORGANISATIONS: Descripteur présent pour chaque organisation",
        "ENTREPRISES: Minuscules sauf acronymes (IBM, SNCF)",
        "ATTRIBUTION L/R: (L) et (R) pour 2 personnes",
        "VERBE: Présent et conjugué",
        "SPORT: Nom explicite si contexte sportif",
        "STADE: Rechercher si manquant",
        "ÉCHAUFFEMENT: 'takes part in warm-up'",
        "PRÉCISION RÉGIONALE: À préserver",
        "PARTIS POLITIQUES: Jamais traduits + abréviation",
        "STRUCTURE: Lieu + date à la fin",
        "DATE FORMAT: Month Day, Year (sans jour)",
        "ASCII: Tirets -, apostrophes '"
    ],
    
    // Checklist sports (10 points)
    sports_checklist: [
        "SPORT: Nom explicite (football, rugby union, etc.)",
        "JOUEURS: Format possessif [Club]'s [player]",
        "ATTRIBUTION: (L)/(R) pour 2 joueurs",
        "QUALITÉ: Avant chaque nom",
        "STADE: Nom officiel",
        "COMPÉTITION: Nom officiel complet",
        "ÉCHAUFFEMENT: 'takes part in warm-up'",
        "CÉLÉBRATIONS: 'his team's Xth goal'",
        "STRUCTURE: Lieu + date à la fin",
        "NUMÉROS: #10, #23 à préserver"
    ],
    
    // Personnalités connues
    personalities: {
        "Xavier Piechaczyk": "RATP CEO",
        "Emmanuel Macron": "French President",
        "Jordan Bardella": "Rassemblement National (RN) President",
        "Marine Le Pen": "Rassemblement National (RN) leader",
        "Jean-Luc Mélenchon": "La France Insoumise (LFI) leader"
    }
};