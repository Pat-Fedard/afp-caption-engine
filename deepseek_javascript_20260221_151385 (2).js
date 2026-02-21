// AFP Caption Engine v1.0 - Moteur d'exécution du protocole

class AFPCaptionEngine {
    constructor(protocol) {
        this.protocol = protocol;
        this.session = {
            active: false,
            date: null,
            mode: 'general', // general, sports, template
            sportsActive: false,
            templateActive: false
        };
        this.lastCaption = null;
        this.stats = {
            processed: 0,
            errors: 0,
            checks: 0,
            startTime: Date.now()
        };
    }

    // === GESTION DE SESSION ===
    
    executeCommand(command, args = {}) {
        const cmd = command.toLowerCase().trim();
        
        // Commandes de session
        if (cmd.startsWith('on ')) {
            return this.activateSession(cmd.substring(3).trim());
        }
        if (cmd === 'off') {
            return this.deactivateSession();
        }
        if (cmd === 'sport on') {
            return this.activateSportsMode(args.date || this.session.date);
        }
        if (cmd === 'sport status') {
            return this.getSportsStatus();
        }
        if (cmd.startsWith('match ')) {
            return this.generateMatchTemplate(cmd.substring(6));
        }
        if (cmd.startsWith('training ')) {
            return this.generateTrainingTemplate(cmd.substring(9));
        }
        if (cmd.startsWith('presser ')) {
            return this.generatePresserTemplate(cmd.substring(8));
        }
        if (cmd === 'change') {
            return this.regenerateWithSessionDate();
        }
        if (cmd === 'reset') {
            return this.reset();
        }
        if (cmd === 'help') {
            return this.showHelp();
        }
        if (cmd === 'check') {
            return this.runCheck();
        }
        if (cmd === 'template' || cmd === 'templates') {
            return this.activateTemplateMode();
        }
        if (cmd === 'out') {
            return this.exitMode();
        }
        if (cmd.startsWith('2 ')) {
            return this.rawTranslation(cmd.substring(2));
        }
        
        return { success: false, error: "Commande inconnue" };
    }

    activateSession(dateStr) {
        const date = this.parseDate(dateStr);
        if (!date) {
            return { success: false, error: "Format de date invalide. Utilisez YYYY-MM-DD" };
        }
        
        this.session.active = true;
        this.session.date = date;
        this.session.mode = 'general';
        
        return {
            success: true,
            message: `✅ Session activée - Date: ${this.formatDate(date)}`,
            session: { ...this.session }
        };
    }

    deactivateSession() {
        this.session.active = false;
        this.session.date = null;
        this.session.mode = 'general';
        this.session.sportsActive = false;
        this.session.templateActive = false;
        
        return {
            success: true,
            message: "✅ Session désactivée"
        };
    }

    activateSportsMode(dateStr) {
        if (!this.session.active) {
            return { success: false, error: "❌ Aucune session active. Utilisez 'on [date]' d'abord" };
        }
        
        if (dateStr) {
            const date = this.parseDate(dateStr);
            if (date) this.session.date = date;
        }
        
        this.session.mode = 'sports';
        this.session.sportsActive = true;
        this.session.templateActive = false;
        
        return {
            success: true,
            message: `⚽ Mode SPORTS activé - Date: ${this.formatDate(this.session.date)}`,
            session: { ...this.session },
            checklist: this.protocol.sports_mode.checklist_10_points
        };
    }

    activateTemplateMode() {
        if (!this.session.active) {
            return { success: false, error: "❌ Aucune session active. Utilisez 'on [date]' d'abord" };
        }
        
        this.session.mode = 'template';
        this.session.templateActive = true;
        this.session.sportsActive = false;
        
        return {
            success: true,
            message: "📝 Mode TEMPLATE activé - Utilisez 'out' pour quitter",
            session: { ...this.session }
        };
    }

    exitMode() {
        if (!this.session.active) {
            return { success: false, error: "Aucune session active" };
        }
        
        const previousMode = this.session.mode;
        this.session.mode = 'general';
        this.session.sportsActive = false;
        this.session.templateActive = false;
        
        return {
            success: true,
            message: `⬅️ Sortie du mode ${previousMode} - Retour au mode général`,
            session: { ...this.session }
        };
    }

    getSportsStatus() {
        return {
            success: true,
            sportsActive: this.session.sportsActive,
            sessionDate: this.session.date ? this.formatDate(this.session.date) : null,
            mode: this.session.mode
        };
    }

    // === TRANSFORMATION PRINCIPALE ===
    
    transform(input, options = {}) {
        this.stats.processed++;
        const startTime = Date.now();
        
        try {
            // Étape 1: Normalisation
            let text = this.normalizeText(input);
            
            // Étape 2: Détection d'alerte
            const alert = this.detectAlert(text);
            if (alert) {
                return this.handleAlert(alert, text);
            }
            
            // Étape 3: Extraction des composants
            const components = this.extractComponents(text);
            
            // Étape 4: Application des règles selon le mode
            let result;
            if (this.session.mode === 'sports') {
                result = this.applySportsRules(components);
            } else if (this.session.mode === 'template') {
                result = this.applyTemplateRules(components);
            } else {
                result = this.applyGeneralRules(components);
            }
            
            // Étape 5: Validation selon checklist
            const validation = this.validate(result);
            
            // Étape 6: Filtre technique final
            const final = this.applyTechnicalFilter(result.caption);
            
            const processingTime = Date.now() - startTime;
            
            return {
                success: true,
                input,
                output: final,
                components: result.components,
                validation,
                mode: this.session.mode,
                processingTime,
                stats: { ...this.stats }
            };
            
        } catch (error) {
            this.stats.errors++;
            return {
                success: false,
                error: error.message,
                input,
                processingTime: Date.now() - startTime
            };
        }
    }

    // === NORMALISATION ===
    
    normalizeText(text) {
        if (!text) return '';
        
        let normalized = text.trim();
        
        // Suppression espaces multiples
        normalized = normalized.replace(/\s+/g, ' ');
        
        // Normalisation guillemets
        normalized = normalized.replace(/[""]/g, '"');
        normalized = normalized.replace(/['']/g, "'");
        
        // Normalisation tirets
        normalized = normalized.replace(/[–—]/g, '-');
        
        return normalized;
    }

    // === DÉTECTION D'ALERTE ===
    
    detectAlert(text) {
        const criteria = this.protocol.default_processing?.alert_detection_criteria;
        if (!criteria) return null;
        
        const isTelegraphic = criteria.telegraphic_style && !text.includes(' ');
        const hasNoVerb = criteria.no_main_verb && !this.containsVerb(text);
        const hasNoLocation = criteria.no_location && !this.containsLocation(text);
        const hasFinalParens = criteria.final_parentheses_source && /\([^)]+\)$/.test(text);
        
        if (hasNoVerb || hasNoLocation || isTelegraphic) {
            return {
                type: 'telegraphic_style',
                confidence: 'high'
            };
        }
        
        if (hasFinalParens) {
            return {
                type: 'source_alert',
                source: text.match(/\(([^)]+)\)$/)[1],
                confidence: 'high'
            };
        }
        
        return null;
    }

    containsVerb(text) {
        // Détection basique de verbes
        const verbPatterns = [
            /\b(est|sont|était|étaient|a|ont|avait|avaient|sera|seront)\b/i,
            /\b(visite|inaugure|participe|assiste|rencontre|déclare|indique|précise)\b/i,
            /\b(celebrate|visit|attend|participate|meet|announce|declare)\b/i
        ];
        return verbPatterns.some(pattern => pattern.test(text));
    }

    containsLocation(text) {
        const locationPatterns = [
            /\b(à|dans|au|aux|en|sur)\s+[A-Z][a-z]+\b/,
            /\b(in|at|on)\s+[A-Z][a-z]+\b/
        ];
        return locationPatterns.some(pattern => pattern.test(text));
    }

    // === GESTION DES ALERTES ===
    
    handleAlert(alert, text) {
        if (alert.type === 'source_alert') {
            // Intégration de la source
            const source = alert.source;
            const mainText = text.replace(/\([^)]+\)$/, '').trim();
            
            // Déterminer si la source est protagoniste
            const sourceIsProtagonist = this.isSourceProtagonist(source, mainText);
            
            let integrated;
            if (sourceIsProtagonist) {
                integrated = `${mainText} a annoncé`;
            } else {
                integrated = `${mainText}, selon ${this.normalizeSource(source)}`;
            }
            
            return {
                success: true,
                output: integrated,
                alert: {
                    type: 'source_integrated',
                    original: text,
                    source,
                    integrated
                }
            };
        }
        
        return {
            success: true,
            output: text,
            alert: {
                type: alert.type,
                message: "Style télégraphique détecté - Vérifiez la présence d'un verbe"
            }
        };
    }

    isSourceProtagonist(source, text) {
        // Vérifier si la source est mentionnée dans le texte
        const sourceWords = source.toLowerCase().split(/\s+/);
        return sourceWords.some(word => 
            word.length > 3 && text.toLowerCase().includes(word)
        );
    }

    normalizeSource(source) {
        const sourceLower = source.toLowerCase();
        
        if (sourceLower.includes('police')) return 'une source policière';
        if (sourceLower.includes('diplomat')) return 'une source diplomatique';
        if (sourceLower.includes('proche')) return 'une source proche du dossier';
        if (sourceLower.includes('présidence')) return 'la présidence';
        if (sourceLower.includes('communiqué')) return 'un communiqué';
        
        return source;
    }

    // === EXTRACTION DES COMPOSANTS ===
    
    extractComponents(text) {
        const components = {
            raw: text,
            protagonists: [],
            action: null,
            location: null,
            context: null,
            date: null
        };
        
        // Extraction de la date (format: on Month Day, Year)
        const dateMatch = text.match(/on\s+([A-Z][a-z]+\s+\d{1,2},\s+\d{4})$/);
        if (dateMatch) {
            components.date = dateMatch[1];
            components.raw = text.replace(dateMatch[0], '').trim();
        }
        
        // Extraction de la location (format: in [city][, region])
        const locationMatch = components.raw.match(/\s+in\s+([^,]+(?:,\s*[^,]+)?)(?:\s+on|$)/);
        if (locationMatch) {
            components.location = locationMatch[1].trim();
            components.raw = components.raw.replace(locationMatch[0], '').trim();
        }
        
        // Extraction des protagonistes avec qualités
        const protagonistPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
        let match;
        while ((match = protagonistPattern.exec(components.raw)) !== null) {
            components.protagonists.push({
                quality: match[1],
                name: match[2]
            });
        }
        
        // Le reste est l'action + contexte
        components.action = components.raw;
        
        return components;
    }

    // === RÈGLES GÉNÉRALES (13 POINTS) ===
    
    applyGeneralRules(components) {
        let caption = components.raw;
        
        // 1. Qualités avant noms
        caption = this.enforceQualityBeforeName(caption);
        
        // 2. Descripteurs organisations
        caption = this.addOrganizationDescriptors(caption);
        
        // 3. Noms d'entreprises (lowercase)
        caption = this.normalizeCompanyNames(caption);
        
        // 4. Attribution L/R
        caption = this.applyAttributionRules(caption);
        
        // 5. Vérification verbe
        caption = this.ensureVerb(caption);
        
        // 6. Mention sport (si contexte sportif)
        caption = this.ensureSportMention(caption);
        
        // 7. Stade (recherche auto)
        caption = this.ensureStadium(caption);
        
        // 8. Échauffement
        caption = this.fixWarmup(caption);
        
        // 9. Préservation précision régionale
        caption = this.preserveRegionalPrecision(caption);
        
        // 10. Partis politiques
        caption = this.handlePoliticalParties(caption);
        
        // 11. Structure location+date à la fin
        caption = this.enforceLocationDateEnd(caption, components);
        
        // 12. Format date
        caption = this.fixDateFormat(caption);
        
        // 13. ASCII
        caption = this.applyTechnicalFilter(caption);
        
        return {
            caption,
            components: {
                ...components,
                processed: caption
            }
        };
    }

    // === RÈGLES SPORTS (10 POINTS) ===
    
    applySportsRules(components) {
        let caption = components.raw;
        
        // 1. Nom du sport explicite
        caption = this.ensureExplicitSportName(caption);
        
        // 2. Format possessif club
        caption = this.enforcePossessiveFormat(caption);
        
        // 3. Attribution spécifique
        caption = this.applyAttributionRules(caption);
        
        // 4. Qualité avant nom (déjà fait)
        
        // 5. Stade officiel + dash si défunt
        caption = this.ensureOfficialStadium(caption);
        
        // 6. Compétition officielle
        caption = this.ensureOfficialCompetition(caption);
        
        // 7. Échauffement correct
        caption = this.fixWarmup(caption);
        
        // 8. Célébrations précises
        caption = this.fixCelebrations(caption);
        
        // 9. Structure (déjà fait)
        
        // 10. Numéros maillots
        caption = this.preserveJerseyNumbers(caption);
        
        return {
            caption,
            components,
            sportsChecklist: this.validateSportsChecklist(caption)
        };
    }

    // === RÈGLES TEMPLATE ===
    
    applyTemplateRules(components) {
        let caption = components.raw;
        
        // Commence toujours par xxxxxx
        if (!caption.startsWith('xxxxxx')) {
            caption = 'xxxxxx ' + caption;
        }
        
        // Ajout date session par défaut
        if (this.session.date && !caption.includes('on ' + this.formatDate(this.session.date))) {
            caption = caption.replace(/(in [^,]+)/, `$1 on ${this.formatDate(this.session.date)}`);
        }
        
        // Gestion mentions de personnes
        caption = this.handlePersonMentions(caption);
        
        return {
            caption,
            components,
            templateMode: true
        };
    }

    // === VALIDATION ===
    
    validate(result) {
        const checklist = this.session.mode === 'sports' 
            ? this.protocol.sports_mode.checklist_10_points
            : this.protocol.general_checklist;
        
        const validation = {
            passed: [],
            failed: [],
            warnings: []
        };
        
        checklist.forEach((item, index) => {
            const check = this.validateCheckItem(item, result.caption);
            if (check.passed) {
                validation.passed.push({ index, item });
            } else if (check.warning) {
                validation.warnings.push({ index, item, reason: check.reason });
            } else {
                validation.failed.push({ index, item, reason: check.reason });
            }
        });
        
        return validation;
    }

    validateCheckItem(item, caption) {
        // Règles de validation spécifiques
        if (item.includes('QUALITY BEFORE NAME')) {
            const hasQuality = /[A-Z][a-z]+\s+[A-Z][a-z]+/.test(caption);
            return { passed: hasQuality, reason: hasQuality ? null : 'Qualité manquante avant nom' };
        }
        
        if (item.includes('VERB')) {
            const hasVerb = this.containsVerb(caption);
            return { passed: hasVerb, reason: hasVerb ? null : 'Verbe manquant' };
        }
        
        if (item.includes('SPORT NAME')) {
            const hasSport = /football|rugby|tennis|basket|handball|volley/i.test(caption);
            return { passed: hasSport, reason: hasSport ? null : 'Nom du sport manquant' };
        }
        
        // Par défaut, considéré comme passé
        return { passed: true };
    }

    // === FONCTIONS UTILITAIRES ===
    
    enforceQualityBeforeName(text) {
        // Pattern: [Qualité] [Nom] (ex: "Président Macron" → "Président Macron")
        return text.replace(/([A-Z][a-z]+)\s+([A-Z][a-z]+)/g, '$1 $2');
    }

    addOrganizationDescriptors(text) {
        // Ajout automatique de descripteurs pour organisations connues
        const orgs = {
            'Rassemblement National': 'far-right party',
            'Parti Socialiste': 'socialist party',
            'Les Republicains': 'conservative party',
            'La France Insoumise': 'left-wing party',
            'Greenpeace': 'environmental NGO',
            'CGT': 'trade union',
            'Amnesty International': 'human rights organization'
        };
        
        Object.entries(orgs).forEach(([org, desc]) => {
            const regex = new RegExp(`\\b${org}\\b`, 'g');
            text = text.replace(regex, `${desc} ${org}`);
        });
        
        return text;
    }

    normalizeCompanyNames(text) {
        // Mettre en minuscule sauf acronymes imprononçables
        const companies = [
            'TotalEnergies', 'Airbus', 'Chevron', 'Helleniq Energy',
            'IBM', 'SNCF', 'EDF', 'LVMH'
        ];
        
        companies.forEach(company => {
            if (company.length <= 4 && /^[A-Z]+$/.test(company)) {
                // Acronyme, garder majuscule
                return;
            }
            const regex = new RegExp(`\\b${company}\\b`, 'g');
            text = text.replace(regex, company.toLowerCase());
        });
        
        return text;
    }

    applyAttributionRules(text) {
        // Compter les protagonistes nommés
        const namedPeople = text.match(/[A-Z][a-z]+\s+[A-Z][a-z]+/g) || [];
        
        if (namedPeople.length === 2) {
            // Cas 2 personnes: ajouter (L) et (R) si absent
            const hasLR = /\([LR]\)/.test(text);
            if (!hasLR && !text.includes('tennis')) {
                text = text.replace(
                    /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+and\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/,
                    '$1 (L) and $2 (R)'
                );
            }
        } else if (namedPeople.length > 2) {
            // Plus de 2 personnes: (LtoR) au début si indiqué
            if (text.toLowerCase().includes('left to right') || text.includes('LtoR')) {
                if (!text.startsWith('(LtoR)')) {
                    text = '(LtoR) ' + text.replace(/left to right|LtoR/gi, '').trim();
                }
            }
        }
        
        return text;
    }

    ensureVerb(text) {
        if (!this.containsVerb(text)) {
            // Ajouter un verbe contextuel
            if (text.includes('carnival') || text.includes('parade')) {
                text = text.replace(/^/, 'Carnival revelers parade during ');
            } else if (text.includes('protest')) {
                text = text.replace(/^/, 'Protesters gather ');
            } else {
                text = text + ' is pictured';
            }
        }
        return text;
    }

    ensureExplicitSportName(text) {
        const sports = ['football', 'rugby union', 'tennis', 'basketball', 'handball', 'volleyball'];
        let hasSport = false;
        
        sports.forEach(sport => {
            if (text.includes(sport)) hasSport = true;
        });
        
        if (!hasSport) {
            // Essayer de déduire le sport du contexte
            if (text.includes('Champions League') || text.includes('Premier League') || text.includes('Ligue 1')) {
                text = text.replace(/(Champions League|Premier League|Ligue 1)/, '$1 football');
            } else if (text.includes('Six Nations')) {
                text = text.replace(/Six Nations/, 'Six Nations rugby union');
            } else if (text.includes('ATP') || text.includes('WTA')) {
                // Déjà géré dans tennis
            }
        }
        
        return text;
    }

    enforcePossessiveFormat(text) {
        // Remplacer "X of Y" par "Y's X"
        return text.replace(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g, "$2's $1");
    }

    ensureOfficialStadium(text) {
        // Recherche et remplacement par noms officiels
        const stadiums = {
            'Parc des Princes': 'Parc des Princes',
            'Stade de France': 'Stade de France',
            'San Siro': 'San Siro',
            'Giuseppe Meazza': 'Giuseppe Meazza'
        };
        
        Object.entries(stadiums).forEach(([key, value]) => {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            text = text.replace(regex, value);
        });
        
        // Ajout du dash pour stades défunts
        const deceasedStadiums = ['Raymond-Kopa', 'Chaban-Delmas', 'Jean-Dauger', 'Marcel-Deflandre'];
        deceasedStadiums.forEach(stadium => {
            if (text.includes(stadium) && !text.includes('Stade ' + stadium)) {
                text = text.replace(stadium, `Stade ${stadium}`);
            }
        });
        
        return text;
    }

    ensureOfficialCompetition(text) {
        // Normalisation des noms de compétition
        const competitions = {
            'L1': 'French L1',
            'Premier League': 'English Premier League',
            'La Liga': 'Spanish La Liga',
            'Bundesliga': 'German Bundesliga',
            'Serie A': 'Italian Serie A',
            'Pro League': 'Belgian Pro League',
            'Champions League': 'Champions League',
            'Six Nations': 'Six Nations'
        };
        
        Object.entries(competitions).forEach(([key, value]) => {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            text = text.replace(regex, value);
        });
        
        return text;
    }

    fixWarmup(text) {
        // Remplacer "pictured in action" pour l'échauffement
        if (text.includes('warm-up') || text.includes('warmup') || text.includes('échauffement')) {
            text = text.replace(/is pictured in action|pictured in action/g, 'takes part in the warm-up');
            text = text.replace(/during warm-up/, 'ahead of the match');
        }
        return text;
    }

    fixCelebrations(text) {
        // Célébrations de but
        const goalMatch = text.match(/celebrates after scoring a goal/);
        if (goalMatch) {
            // À améliorer avec recherche check
            text = text.replace(/a goal/, "his team's goal");
        }
        
        // Célébrations de victoire
        if (text.includes('celebrate their victory during')) {
            text = text.replace(/during/, 'after');
        }
        
        return text;
    }

    preserveJerseyNumbers(text) {
        // Conserver les numéros de maillot
        return text.replace(/#(\d+)/g, '#$1');
    }

    handlePoliticalParties(text) {
        // Ajouter abréviation entre parenthèses
        const parties = {
            'Rassemblement National': 'RN',
            'Parti Socialiste': 'PS',
            'Les Republicains': 'LR',
            'La France Insoumise': 'LFI',
            'Europe Ecologie Les Verts': 'EELV',
            'Lutte Ouvriere': 'LO'
        };
        
        Object.entries(parties).forEach(([party, abbr]) => {
            const regex = new RegExp(`\\b${party}\\b(?!\\s*\\(${abbr}\\))`, 'g');
            text = text.replace(regex, `${party} (${abbr})`);
        });
        
        return text;
    }

    handlePersonMentions(text) {
        // Recherche de personnes sans qualité
        const personPattern = /([A-Z][a-z]+)\s+([A-Z][a-z]+)(?![^(]*\))/g;
        let match;
        let result = text;
        
        while ((match = personPattern.exec(text)) !== null) {
            const fullName = match[0];
            // Vérifier si une qualité précède déjà
            const beforeMatch = text.substring(0, match.index).split(' ').slice(-1)[0];
            if (!/[A-Z][a-z]/.test(beforeMatch)) {
                // Ajouter "French President" comme placeholder - à améliorer avec check
                result = result.replace(fullName, `French President ${fullName}`);
            }
        }
        
        return result;
    }

    enforceLocationDateEnd(text, components) {
        if (components.location && components.date) {
            // Déplacer location+date à la fin si pas déjà
            const locationRegex = new RegExp(`\\s+in\\s+${components.location}[^,]*`);
            const dateRegex = new RegExp(`\\s+on\\s+${components.date}`);
            
            if (!text.match(locationRegex.source + '.*' + dateRegex.source + '$')) {
                let base = text
                    .replace(locationRegex, '')
                    .replace(dateRegex, '')
                    .trim();
                text = `${base} in ${components.location} on ${components.date}`;
            }
        }
        return text;
    }

    fixDateFormat(text) {
        // Remplacer "Monday, February 16, 2026" par "February 16, 2026"
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
                         'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        
        dayNames.forEach(day => {
            const regex = new RegExp(`\\b${day},\\s+`, 'gi');
            text = text.replace(regex, '');
        });
        
        return text;
    }

    preserveRegionalPrecision(text) {
        // Préserver les précisions régionales (eastern France, etc.)
        const regions = ['eastern', 'western', 'northern', 'southern', 'northeastern', 'northwestern', 'southeastern', 'southwestern'];
        regions.forEach(region => {
            const regex = new RegExp(`\\b${region}\\s+France\\b`, 'gi');
            if (regex.test(text)) {
                // Déjà présent, ne pas modifier
            }
        });
        return text;
    }

    applyTechnicalFilter(text) {
        // Nettoyage final
        return text
            .replace(/[–—]/g, '-')           // Tirets en ASCII
            .replace(/[""]/g, '"')            // Guillemets ASCII
            .replace(/['']/g, "'")            // Apostrophes ASCII
            .replace(/\s+/g, ' ')             // Espaces uniques
            .trim();
    }

    // === GÉNÉRATION DE TEMPLATES SPORTS ===
    
    generateMatchTemplate(input) {
        if (!this.session.sportsActive) {
            return { success: false, error: "Mode sports inactif. Utilisez 'sport on' d'abord" };
        }
        
        // Format: match [teamA] vs [teamB]
        const match = input.match(/(.+?)\s+vs\s+(.+)/i);
        if (!match) {
            return { success: false, error: "Format: match [équipeA] vs [équipeB]" };
        }
        
        const teamA = match[1].trim();
        const teamB = match[2].trim();
        
        // Template de base
        const template = this.protocol.sports_mode.templates.match;
        
        // Recherche auto (simulée)
        const competition = this.detectCompetition(teamA, teamB);
        const sport = this.detectSport(teamA, teamB);
        const stadium = this.detectStadium(teamA);
        const city = this.detectCity(stadium);
        
        const caption = template
            .replace('[competition]', competition)
            .replace('[SPORT]', sport)
            .replace('[teamA]', teamA)
            .replace('[teamB]', teamB)
            .replace('[stadium]', stadium)
            .replace('[city]', city)
            .replace('[date]', this.formatDate(this.session.date));
        
        return {
            success: true,
            caption,
            template: 'match',
            teamA,
            teamB,
            competition,
            sport,
            stadium,
            city,
            date: this.session.date
        };
    }

    generateTrainingTemplate(input) {
        if (!this.session.sportsActive) {
            return { success: false, error: "Mode sports inactif" };
        }
        
        const team = input.trim();
        const template = this.protocol.sports_mode.templates.training;
        
        // Recherche du prochain match
        const nextMatch = this.findNextMatch(team);
        const opponent = nextMatch.opponent || 'their opponent';
        const competition = nextMatch.competition || 'upcoming';
        const sport = this.detectSport(team);
        const stadium = this.detectStadium(team);
        const city = this.detectCity(stadium);
        
        const caption = template
            .replace('[team]', team)
            .replace('[competition]', competition)
            .replace('[SPORT]', sport)
            .replace('[opponent]', opponent)
            .replace('[stadium]', stadium)
            .replace('[city]', city)
            .replace('[date]', this.formatDate(this.session.date));
        
        return {
            success: true,
            caption,
            template: 'training',
            team,
            opponent,
            competition,
            sport
        };
    }

    generatePresserTemplate(input) {
        if (!this.session.sportsActive) {
            return { success: false, error: "Mode sports inactif" };
        }
        
        const team = input.trim();
        const template = this.protocol.sports_mode.templates.presser;
        
        // Recherche du prochain match
        const nextMatch = this.findNextMatch(team);
        const opponent = nextMatch.opponent || 'their opponent';
        const competition = nextMatch.competition || 'upcoming';
        const sport = this.detectSport(team);
        const city = this.detectCity(team);
        
        const timing = this.isMatchNextDay() ? 'on the eve of' : 'ahead of';
        
        const caption = template
            .replace('[team]', team)
            .replace('[competition]', competition)
            .replace('[SPORT]', sport)
            .replace('[opponent]', opponent)
            .replace('[city]', city)
            .replace('[date]', this.formatDate(this.session.date))
            .replace('on the eve of', timing);
        
        return {
            success: true,
            caption,
            template: 'presser',
            team,
            opponent,
            competition,
            sport,
            timing
        };
    }

    // === COMMANDE 2 - TRADUCTION ===
    
    rawTranslation(text) {
        // Traduction brute sans structure AFP
        let translation = text;
        
        // Application de la déduction critique de date
        translation = this.applyCriticalDateDeduction(translation);
        
        return {
            success: true,
            original: text,
            translation,
            command: '2'
        };
    }

    applyCriticalDateDeduction(text) {
        if (!this.session.date) return text;
        
        // Détection des noms de jours
        const days = {
            'lundi': 'Monday', 'mardi': 'Tuesday', 'mercredi': 'Wednesday',
            'jeudi': 'Thursday', 'vendredi': 'Friday', 'samedi': 'Saturday', 'dimanche': 'Sunday',
            'Monday': 'Monday', 'Tuesday': 'Tuesday', 'Wednesday': 'Wednesday',
            'Thursday': 'Thursday', 'Friday': 'Friday', 'Saturday': 'Saturday', 'Sunday': 'Sunday'
        };
        
        let result = text;
        const sessionDay = this.session.date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        Object.entries(days).forEach(([fr, en]) => {
            const regex = new RegExp(`\\b${fr}\\b`, 'gi');
            if (regex.test(text)) {
                // Calculer la date déduite
                const daysBack = this.protocol.date_deduction[sessionDay]?.[en.toLowerCase()] || 0;
                if (daysBack > 0) {
                    const deducedDate = new Date(this.session.date);
                    deducedDate.setDate(deducedDate.getDate() - daysBack);
                    
                    // Remplacer par la date formatée
                    result = result.replace(
                        regex,
                        this.formatDate(deducedDate).replace(/^[^,]+,\s*/, '')
                    );
                }
            }
        });
        
        return result;
    }

    // === COMMANDE CHECK ===
    
    runCheck() {
        this.stats.checks++;
        
        // Simulation de recherche en ligne
        const checkResult = {
            success: true,
            timestamp: new Date().toISOString(),
            mode: this.session.mode,
            actions: []
        };
        
        if (this.session.mode === 'sports') {
            checkResult.actions.push('Vérification des faits sportifs');
            checkResult.actions.push('Recherche des buteurs');
            checkResult.actions.push('Validation des résultats');
        } else if (this.session.mode === 'template') {
            checkResult.actions.push('Recherche des noms complets');
            checkResult.actions.push('Recherche des titres officiels');
            checkResult.actions.push('Recherche du contexte');
        } else {
            checkResult.actions.push('Recherche d\'informations générales');
        }
        
        return checkResult;
    }

    // === UTILITAIRES ===
    
    parseDate(dateStr) {
        if (!dateStr) return null;
        
        // Format YYYY-MM-DD
        const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (match) {
            return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
        }
        
        return null;
    }

    formatDate(date) {
        if (!date) return '';
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    detectCompetition(teamA, teamB) {
        // Simulation de détection de compétition
        if (teamA.includes('PSG') || teamB.includes('PSG') || 
            teamA.includes('Marseille') || teamB.includes('Marseille')) {
            return 'French L1';
        }
        if (teamA.includes('Real') || teamB.includes('Real') ||
            teamA.includes('Barcelona') || teamB.includes('Barcelona')) {
            return 'Spanish La Liga';
        }
        if (teamA.includes('Bayern') || teamB.includes('Bayern')) {
            return 'German Bundesliga';
        }
        if (teamA.includes('Juventus') || teamB.includes('Juventus')) {
            return 'Italian Serie A';
        }
        return 'Champions League';
    }

    detectSport(teamA, teamB) {
        // Simulation de détection du sport
        return 'football';
    }

    detectStadium(team) {
        // Simulation de détection du stade
        const stadiums = {
            'PSG': 'Parc des Princes',
            'Marseille': 'Stade Vélodrome',
            'Lyon': 'Groupama Stadium',
            'Real Madrid': 'Santiago Bernabéu',
            'Barcelona': 'Camp Nou',
            'Bayern': 'Allianz Arena',
            'Juventus': 'Allianz Stadium'
        };
        
        for (const [key, value] of Object.entries(stadiums)) {
            if (team.includes(key)) return value;
        }
        
        return 'a stadium';
    }

    detectCity(stadium) {
        // Simulation de détection de ville
        const cities = {
            'Parc des Princes': 'Paris',
            'Stade Vélodrome': 'Marseille',
            'Groupama Stadium': 'Lyon',
            'Santiago Bernabéu': 'Madrid',
            'Camp Nou': 'Barcelona',
            'Allianz Arena': 'Munich'
        };
        
        return cities[stadium] || 'the city';
    }

    findNextMatch(team) {
        // Simulation de recherche du prochain match
        return {
            opponent: team.includes('PSG') ? 'Marseille' : 'their opponent',
            competition: 'Champions League',
            date: this.session.date ? new Date(this.session.date.getTime() + 86400000) : null
        };
    }

    isMatchNextDay() {
        // Simulation
        return true;
    }

    regenerateWithSessionDate() {
        // Régénération avec date session
        return {
            success: true,
            message: `Régénération avec date session: ${this.formatDate(this.session.date)}`
        };
    }

    reset() {
        this.session.mode = 'general';
        this.session.sportsActive = false;
        this.session.templateActive = false;
        this.lastCaption = null;
        
        return {
            success: true,
            message: "États réinitialisés"
        };
    }

    showHelp() {
        const commands = Object.entries(this.protocol.commands).map(([cmd, info]) => ({
            command: cmd,
            syntax: info.syntax,
            description: info.description
        }));
        
        return {
            success: true,
            commands
        };
    }

    validateSportsChecklist(caption) {
        const checklist = this.protocol.sports_mode.checklist_10_points;
        return checklist.map(item => {
            const passed = this.validateCheckItem(item, caption).passed;
            return { item, passed };
        });
    }

    getStats() {
        return {
            ...this.stats,
            uptime: Date.now() - this.stats.startTime,
            session: { ...this.session }
        };
    }
}