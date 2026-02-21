// AFP Protocol v8.11 - Version compilée exécutable
const AFP_PROTOCOL = {
    version: "8.11",
    compiled: "2026-02-21",
    
    // Commandes système
    commands: {
        on: {
            syntax: "on [date]",
            action: "activate_session",
            description: "Active la session AFP avec date"
        },
        off: {
            syntax: "off",
            action: "deactivate_session",
            description: "Désactive la session"
        },
        "sport on": {
            syntax: "sport on [date]",
            action: "activate_sports_mode",
            description: "Active le mode sports avec date"
        },
        "sport status": {
            syntax: "sport status",
            action: "show_sports_mode_status",
            description: "Affiche statut mode sports"
        },
        match: {
            syntax: "match [teamA] vs [teamB]",
            action: "auto_generate_match_template",
            requires: "sports_mode",
            description: "Génère template match"
        },
        training: {
            syntax: "training [team]",
            action: "auto_generate_training_template",
            requires: "sports_mode",
            description: "Génère template entraînement"
        },
        presser: {
            syntax: "presser [team]",
            action: "auto_generate_presser_template",
            requires: "sports_mode",
            description: "Génère template conférence presse"
        },
        change: {
            syntax: "change",
            action: "regenerate_with_session_date",
            description: "Régénère avec date session"
        },
        reset: {
            syntax: "reset",
            action: "reset_states",
            description: "Reset tous les états"
        },
        help: {
            syntax: "help",
            action: "display_commands",
            description: "Affiche l'aide"
        },
        check: {
            syntax: "check",
            action: "search_context",
            description: "Recherche contexte en ligne"
        },
        template: {
            syntax: "template",
            action: "activate_template_mode",
            description: "Active mode template"
        },
        out: {
            syntax: "out",
            action: "exit_mode",
            description: "Sort du mode actuel"
        },
        "2": {
            syntax: "2 [text]",
            action: "raw_translation",
            description: "Traduction brute fidèle"
        }
    },

    // Règles fondamentales
    fundamentals: {
        neutrality: {
            absolute_neutrality: true,
            no_subjectives: true,
            no_interpretation: true,
            no_addition: true
        },
        sentence: {
            must_have_verb: true,
            format: "[Subject] + [verb] + [complement] + [location] + [date]",
            forbidden: ["captions without verbs"]
        },
        technical: {
            charset: "ASCII",
            dash: "-",
            quotes: '"',
            apostrophe: "'",
            sentence_count: 1
        }
    },

    // Structure générale
    structure: {
        element_order: {
            standard: "protagonists + action + location + context + date",
            location_date_position: "always at end",
            date_format: "[Month] [day], [year]",
            no_day_names: true
        },
        location: {
            no_country: true,
            preserve_regional_precision: true,
            stadium: {
                exact_name_if_known: true,
                auto_search: true,
                dash_for_deceased: true
            }
        },
        persons: {
            quality_before_name: true,
            applies_to_all: true,
            compound_first_names_dash: true,
            verify_each_individually: true
        },
        organizations: {
            descriptor_required: true,
            format: "[type/orientation] [name]",
            political_parties: {
                never_translate: true,
                abbreviation_in_parentheses: true
            }
        },
        companies: {
            lowercase_except_acronyms: true,
            test: "if pronouncable as word → lowercase"
        }
    },

    // Attribution L/R
    attribution: {
        case_2_named_no_positioning: {
            rule: "Use (L) and (R)",
            format: "Protagonist 1 (L) and Protagonist 2 (R)"
        },
        case_2_named_with_positioning: {
            rule: "Use specific positioning",
            formats: ["(2ndL)", "(3rdL)", "(4thL)", "(2ndR)", "(3rdR)", "(4thR)", "(C)"]
        },
        case_more_than_2: {
            with_ltr: "(LtoR) at beginning",
            without_positioning: "no attribution"
        },
        exceptions: ["tennis"]
    },

    // Checklist générale (13 points)
    general_checklist: [
        "PERSONS: Quality BEFORE name for EACH person mentioned",
        "ORGANIZATIONS: Descriptor present for each org/association",
        "COMPANIES: Lowercase (except acronyms like IBM, SNCF)",
        "ATTRIBUTION L/R: Check count and apply correct rule",
        "VERB: Present and correct conjugation",
        "SPORT MENTION: Explicitly named if sports context",
        "STADIUM: Search if missing, dash if deceased",
        "WARM-UP: 'takes part in warm-up' (never 'pictured in action')",
        "REGIONAL PRECISION: Preserve if present",
        "POLITICAL PARTY: Never translate + add abbreviation",
        "STRUCTURE: Location + date at end",
        "DATE FORMAT: [Month] [day], [year] (no day name)",
        "ASCII: All dashes -, apostrophes ', quotes \""
    ],

    // Mode sports
    sports_mode: {
        checklist_10_points: [
            "SPORT NAME: Explicitly mentioned (football, rugby union, tennis, etc.)",
            "PLAYERS: [Club]'s [player] possessive form",
            "ATTRIBUTION: 2 named → (L)/(R) or specific positioning",
            "QUALITY BEFORE NAME: For EACH person",
            "STADIUM: Official name + dash for deceased",
            "COMPETITION: Full official name",
            "WARM-UP: 'takes part in', 'practices' (never 'pictured in action')",
            "CELEBRATIONS: 'his team's Xth goal' / 'after the match'",
            "STRUCTURE: location + date at END",
            "JERSEY NUMBERS: Preserve if present (#10)"
        ],
        
        templates: {
            match: "xxxxxx during the [competition] [SPORT] match between [teamA] and [teamB] at [stadium] in [city] on [date]",
            training: "xxxxxx takes part in the warm-up ahead of [team]'s [competition] [SPORT] match against [opponent] at [stadium] in [city] on [date]",
            presser: "xxxxxx gives a press conference on the eve of [team]'s [competition] [SPORT] match against [opponent] in [city] on [date]"
        },
        
        sport_mention_mandatory: true,
        player_format: "[Club]'s [player]",
        stadium_research_auto: true,
        victory_celebration: "after the match",
        tennis_format: "Country's Player1 hits a return to Country's Player2 during their [City] ATP/WTA tournament tennis match",
        rugby_union: "always use 'rugby union'"
    },

    // Mode template non-sports
    template_mode: {
        always_starts_with: "xxxxxx",
        date_handling: "session date by default",
        no_country: true,
        never_include_non_photographed: true,
        person_mentions: {
            rule: "Event organized around mentioned person",
            format: "xxxxxx [Quality] [Name] visits/attends..."
        },
        judicial: {
            format: "xxxxxx arrives at [city]'s courthouse to attend a hearing of [trial details] in [city] on [date]",
            never_during: true
        },
        press_conference: {
            format: "xxxxxx gives a press conference on the eve/ahead of [team]'s [competition] [SPORT] match",
            auto_search_match: true
        },
        cultural: "xxxxxx attends [event] at [venue] in [city] on [date]",
        protests: "xxxxxx demonstrate [for/against cause] at [location] in [city] on [date]",
        official_meetings: "xxxxxx [Title] [Name] (L) and [Title] [Name] (R) meet at [venue]"
    },

    // Commande 2 - Traduction
    command_2: {
        raw_translation: true,
        strictly_faithful: true,
        no_AFP_structure: true,
        no_additions: true,
        no_interpretation: true,
        output: "translation only",
        critical_date_deduction: {
            trigger: "day name detected",
            algorithm: "count back from session date",
            output_format: "[Month] [Day], [Year]",
            remove_day_name: true,
            must_be_past: true
        }
    },

    // Date deduction quick reference
    date_deduction: {
        monday: { mon:7, tue:6, wed:5, thu:4, fri:3, sat:2, sun:1 },
        tuesday: { mon:1, tue:7, wed:6, thu:5, fri:4, sat:3, sun:2 },
        wednesday: { mon:2, tue:1, wed:7, thu:6, fri:5, sat:4, sun:3 },
        thursday: { mon:3, tue:2, wed:1, thu:7, fri:6, sat:5, sun:4 },
        friday: { mon:4, tue:3, wed:2, thu:1, fri:7, sat:6, sun:5 },
        saturday: { mon:5, tue:4, wed:3, thu:2, fri:1, sat:7, sun:6 },
        sunday: { mon:6, tue:5, wed:4, thu:3, fri:2, sat:1, sun:7 }
    },

    // Mots/clés interdits
    forbidden: {
        verbs: ["pictured without is"],
        formations: ["of for players", "during victory"],
        subjective: ["extraordinaire", "incroyable", "malheureusement"],
        first_person: ["je", "nous", "moi", "notre"]
    },

    // Règles spéciales par contexte
    special_rules: {
        inaugurations: {
            with_ceremony: "attend the inauguration ceremony of",
            without_ceremony: "visit [location] on its inauguration day"
        },
        judicial: {
            never_during: true,
            authorized: ["arrives to attend", "arrives at court", "leaves after"]
        },
        active_verbs: {
            prefer_over_pictured: true,
            mapping: {
                inauguration: "visit",
                conference: ["attend", "speak"],
                meeting: "meet"
            }
        }
    },

    // Filtre technique final
    technical_filter: {
        dashes: "ASCII -",
        quotes: 'ASCII " "',
        apostrophes: "ASCII '",
        remove_non_ascii: true
    }
};

// Exporter pour utilisation dans engine.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AFP_PROTOCOL;
}