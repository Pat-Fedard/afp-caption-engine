// AFP Caption Engine - Interface utilisateur
class AFPInterface {
    constructor() {
        this.engine = new AFPCaptionEngine(AFP_PROTOCOL);
        this.initElements();
        this.initEventListeners();
        this.updateUI();
    }
    
    initElements() {
        this.commandInput = document.getElementById('commandInput');
        this.inputText = document.getElementById('inputText');
        this.outputText = document.getElementById('outputText');
        this.sessionDisplay = document.getElementById('sessionDisplay');
        this.modeDisplay = document.getElementById('modeDisplay');
    }
    
    initEventListeners() {
        document.getElementById('executeBtn').addEventListener('click', () => this.executeCommand());
        document.getElementById('transformBtn').addEventListener('click', () => this.transform());
        document.getElementById('clearBtn').addEventListener('click', () => this.clear());
    }
    
    executeCommand() {
        const cmd = this.commandInput.value.trim();
        if (!cmd) return;
        
        const result = this.engine.executeCommand(cmd);
        if (result.success) {
            alert(result.message);
            this.updateUI();
        } else {
            alert(result.error);
        }
        this.commandInput.value = '';
    }
    
    transform() {
        const input = this.inputText.value.trim();
        if (!input) {
            alert('Entrez une légende');
            return;
        }
        
        const result = this.engine.transform(input);
        this.outputText.innerText = result.output;
        this.updateUI();
    }
    
    clear() {
        this.inputText.value = '';
        this.outputText.innerText = '';
    }
    
    updateUI() {
        const session = this.engine.getSession();
        let status = 'inactive';
        if (session.active) {
            status = `active - ${session.date}`;
        }
        this.sessionDisplay.innerText = `Session: ${status}`;
        
        let mode = 'général';
        if (session.mode === 'sports') mode = 'SPORTS';
        if (session.mode === 'template') mode = 'TEMPLATE';
        this.modeDisplay.innerText = `Mode: ${mode}`;
    }
}

// Initialisation quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AFPInterface();
});
