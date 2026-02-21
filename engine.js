// AFP Caption Engine - Moteur principal
class AFPCaptionEngine {
    constructor(protocol) {
        this.protocol = protocol;
        this.session = {
            active: false,
            date: null,
            mode: 'general' // general, sports, template
        };
    }
    
    // Exécuter une commande
    executeCommand(cmd) {
        if (cmd.startsWith('on ')) {
            this.session.active = true;
            this.session.date = cmd.substring(3).trim();
            return { success: true, message: `Session activée: ${this.session.date}` };
        }
        else if (cmd === 'off') {
            this.session.active = false;
            this.session.date = null;
            this.session.mode = 'general';
            return { success: true, message: 'Session désactivée' };
        }
        else if (cmd === 'sport on') {
            if (!this.session.active) return { success: false, error: 'Activez d\'abord une session' };
            this.session.mode = 'sports';
            return { success: true, message: 'Mode sports activé' };
        }
        else if (cmd === 'template') {
            if (!this.session.active) return { success: false, error: 'Activez d\'abord une session' };
            this.session.mode = 'template';
            return { success: true, message: 'Mode template activé' };
        }
        else if (cmd === 'out') {
            this.session.mode = 'general';
            return { success: true, message: 'Retour mode général' };
        }
        return { success: false, error: 'Commande inconnue' };
    }
    
    // Transformer une légende
    transform(input) {
        let output = input;
        
        // Appliquer les qualités avant les noms
        for (let [name, quality] of Object.entries(this.protocol.personalities)) {
            let regex = new RegExp(name, 'g');
            output = output.replace(regex, quality + ' ' + name);
        }
        
        // Corriger le format possessif
        output = output.replace(/(\w+)\s+of\s+(\w+)/g, "$2's $1");
        
        // Mode sports
        if (this.session.mode === 'sports') {
            if (output.includes('vs')) {
                output = output.replace(/(\w+)\s+vs\s+(\w+)/, 
                    'xxxxxx during the football match between $1 and $2');
            }
        }
        
        // Mode template
        if (this.session.mode === 'template' && !output.startsWith('xxxxxx')) {
            output = 'xxxxxx ' + output;
        }
        
        // Ajouter la date de session
        if (this.session.active && this.session.date && !output.includes('on ' + this.session.date)) {
            output = output + ' in Paris on ' + this.session.date;
        }
        
        // Commande 2 (traduction)
        if (input.startsWith('2 ')) {
            output = input.substring(2) + ' [TRADUCTION BRUTE]';
        }
        
        return {
            success: true,
            output: output,
            mode: this.session.mode,
            session: this.session
        };
    }
    
    getSession() {
        return this.session;
    }
}
