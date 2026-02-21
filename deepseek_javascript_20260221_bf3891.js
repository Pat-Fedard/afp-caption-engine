// Interface utilisateur pour AFP Caption Engine

class AFPInterface {
    constructor() {
        this.engine = new AFPCaptionEngine(AFP_PROTOCOL);
        this.initElements();
        this.initEventListeners();
        this.updateUI();
        this.loadExamples();
    }

    initElements() {
        // Commandes
        this.commandInput = document.getElementById('commandInput');
        this.executeBtn = document.getElementById('executeCommand');
        this.helpBtn = document.getElementById('helpBtn');
        
        // Input/Output
        this.inputCaption = document.getElementById('inputCaption');
        this.outputCaption = document.getElementById('outputCaption');
        this.inputStats = document.getElementById('inputStats');
        this.outputStats = document.getElementById('outputStats');
        this.processingTime = document.getElementById('processingTime');
        
        // Boutons
        this.transformBtn = document.getElementById('transformBtn');
        this.checkBtn = document.getElementById('checkBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.clearInput = document.getElementById('clearInput');
        this.clearOutput = document.getElementById('clearOutput');
        this.copyOutput = document.getElementById('copyOutput');
        this.pasteExample = document.getElementById('pasteExample');
        
        // Affichages
        this.sessionStatus = document.getElementById('sessionStatus');
        this.sessionDate = document.getElementById('sessionDate');
        this.modeDisplay = document.getElementById('modeDisplay');
        this.footerSession = document.getElementById('footerSession');
        this.checklistDisplay = document.getElementById('checklistDisplay');
        this.componentsDisplay = document.getElementById('componentsDisplay');
        this.sportsDisplay = document.getElementById('sportsDisplay');
        this.commandsList = document.getElementById('commandsList');
        this.debugDisplay = document.getElementById('debugDisplay');
        
        // Tabs
        this.tabs = document.querySelectorAll('.tab');
    }

    initEventListeners() {
        // Commandes
        this.executeBtn.addEventListener('click', () => this.executeCommand());
        this.commandInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.executeCommand();
        });
        this.helpBtn.addEventListener('click', () => this.showHelp());
        
        // Transformation
        this.transformBtn.addEventListener('click', () => this.transform());
        this.checkBtn.addEventListener('click', () => this.runCheck());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.exportBtn.addEventListener('click', () => this.exportCaption());
        
        // Actions input/output
        this.clearInput.addEventListener('click', () => {
            this.inputCaption.value = '';
            this.updateStats();
        });
        
        this.clearOutput.addEventListener('click', () => {
            this.outputCaption.value = '';
            this.updateStats();
        });
        
        this.copyOutput.addEventListener('click', () => {
            this.outputCaption.select();
            document.execCommand('copy');
            this.showNotification('Copié!');
        });
        
        this.pasteExample.addEventListener('click', () => this.pasteExample());
        
        // Input stats
        this.inputCaption.addEventListener('input', () => this.updateStats());
        
        // Tabs
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
    }

    executeCommand() {
        const command = this.commandInput.value.trim();
        if (!command) return;
        
        const result = this.engine.executeCommand(command);
        
        if (result.success) {
            this.showNotification(result.message || 'Commande exécutée');
            this.updateUI();
            
            // Si la commande génère un template, l'afficher
            if (result.caption) {
                this.inputCaption.value = result.caption;
            }
        } else {
            this.showNotification(result.error || 'Erreur', 'error');
        }
        
        this.commandInput.value = '';
        this.updateDebug();
    }

    transform() {
        const input = this.inputCaption.value.trim();
        if (!input) {
            this.showNotification('Entrez une légende', 'warning');
            return;
        }
        
        const result = this.engine.transform(input);
        
        if (result.success) {
            this.outputCaption.value = result.output;
            this.processingTime.textContent = `⏱️ ${result.processingTime}ms`;
            
            // Mise à jour des composants
            this.componentsDisplay.textContent = JSON.stringify(result.components, null, 2);
            
            // Mise à jour de la checklist
            this.updateChecklist(result.validation);
            
            // Mise à jour des infos sports
            if (result.mode === 'sports' && result.sportsChecklist) {
                this.updateSportsInfo(result.sportsChecklist);
            }
        } else {
            this.showNotification(result.error || 'Erreur de transformation', 'error');
        }
        
        this.updateStats();
        this.updateDebug();
    }

    runCheck() {
        const result = this.engine.runCheck();
        this.showNotification(`Check exécuté: ${result.actions.join(', ')}`);
        this.updateDebug();
    }

    reset() {
        const result = this.engine.reset();
        this.inputCaption.value = '';
        this.outputCaption.value = '';
        this.updateUI();
        this.showNotification(result.message);
    }

    exportCaption() {
        const output = this.outputCaption.value;
        if (!output) {
            this.showNotification('Rien à exporter', 'warning');
            return;
        }
        
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `caption_${new Date().toISOString().slice(0,10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    pasteExample() {
        const examples = [
            "Xavier Piechaczyk dans un atelier",
            "Emmanuel Macron inaugure une école",
            "PSG vs Marseille au Parc des Princes",
            "Entraînement du PSG avant le match",
            "Conférence de presse de Deschamps"
        ];
        
        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        this.inputCaption.value = randomExample;
        this.updateStats();
    }

    updateUI() {
        const session = this.engine.session;
        
        // Session status
        if (session.active) {
            this.sessionStatus.textContent = '● Session active';
            this.sessionStatus.className = 'session-status active';
            this.footerSession.textContent = `active (${this.engine.formatDate(session.date)})`;
            
            if (session.date) {
                this.sessionDate.textContent = `Date: ${this.engine.formatDate(session.date)}`;
            }
            
            // Mode
            if (session.mode === 'sports') {
                this.modeDisplay.textContent = 'Mode: SPORTS ⚽';
                this.modeDisplay.style.background = '#e67e22';
            } else if (session.mode === 'template') {
                this.modeDisplay.textContent = 'Mode: TEMPLATE 📝';
                this.modeDisplay.style.background = '#3498db';
            } else {
                this.modeDisplay.textContent = 'Mode: Général 📰';
                this.modeDisplay.style.background = '#27ae60';
            }
        } else {
            this.sessionStatus.textContent = '● Session inactive';
            this.sessionStatus.className = 'session-status inactive';
            this.sessionDate.textContent = '';
            this.footerSession.textContent = 'inactive';
            this.modeDisplay.textContent = 'Mode: Général';
            this.modeDisplay.style.background = '#27ae60';
        }
        
        // Commandes list
        this.updateCommandsList();
    }

    updateCommandsList() {
        if (!this.commandsList) return;
        
        const commands = [
            { cmd: "on 2026-02-21", desc: "Activer session" },
            { cmd: "off", desc: "Désactiver session" },
            { cmd: "sport on", desc: "Activer mode sports" },
            { cmd: "sport status", desc: "Statut mode sports" },
            { cmd: "match PSG vs Marseille", desc: "Template match" },
            { cmd: "training PSG", desc: "Template entraînement" },
            { cmd: "presser PSG", desc: "Template conf presse" },
            { cmd: "template", desc: "Mode template" },
            { cmd: "out", desc: "Sortir du mode" },
            { cmd: "check", desc: "Recherche contexte" },
            { cmd: "2 texte à traduire", desc: "Traduction brute" },
            { cmd: "change", desc: "Régénérer avec date" },
            { cmd: "reset", desc: "Reset" },
            { cmd: "help", desc: "Aide" }
        ];
        
        this.commandsList.innerHTML = commands.map(c => `
            <div class="command-card">
                <div class="command">${c.cmd}</div>
                <div class="desc">${c.desc}</div>
            </div>
        `).join('');
    }

    updateChecklist(validation) {
        if (!this.checklistDisplay) return;
        
        const allItems = [
            ...(validation.passed || []).map(i => ({ ...i, status: 'valid' })),
            ...(validation.warnings || []).map(i => ({ ...i, status: 'warning' })),
            ...(validation.failed || []).map(i => ({ ...i, status: 'invalid' }))
        ].sort((a, b) => a.index - b.index);
        
        this.checklistDisplay.innerHTML = allItems.map(item => `
            <div class="checklist-item ${item.status}">
                <strong>${item.status === 'valid' ? '✅' : item.status === 'warning' ? '⚠️' : '❌'}</strong>
                ${item.item}
                ${item.reason ? `<br><small>${item.reason}</small>` : ''}
            </div>
        `).join('');
    }

    updateSportsInfo(checklist) {
        if (!this.sportsDisplay) return;
        
        const validCount = checklist.filter(c => c.passed).length;
        
        this.sportsDisplay.innerHTML = `
            <div class="sports-info">
                <h4>⚽ Mode Sports - 10 points</h4>
                <p>Validés: ${validCount}/10</p>
                <ul class="sports-checklist">
                    ${checklist.map(c => `
                        <li style="color: ${c.passed ? '#27ae60' : '#e10000'}">
                            ${c.passed ? '✅' : '❌'} ${c.item}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    updateStats() {
        const inputLength = this.inputCaption.value.length;
        const outputLength = this.outputCaption.value.length;
        
        this.inputStats.textContent = `${inputLength} caractères`;
        this.outputStats.textContent = `${outputLength} caractères`;
    }

    updateDebug() {
        if (!this.debugDisplay) return;
        
        const debug = {
            session: this.engine.session,
            stats: this.engine.getStats(),
            lastCommand: this.commandInput.value || null,
            timestamp: new Date().toISOString()
        };
        
        this.debugDisplay.textContent = JSON.stringify(debug, null, 2);
    }

    switchTab(tabName) {
        // Mise à jour des tabs
        this.tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Mise à jour du contenu
        document.querySelectorAll('.tab-content').forEach(content => {
            if (content.id === tabName + 'Tab') {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }

    showNotification(message, type = 'success') {
        // Création d'une notification simple
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e10000' : '#f39c12'};
            color: white;
            border-radius: 8px;
            font-size: 14px;
            z-index: 1000;
            animation: slideIn 0.3s;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    loadExamples() {
        // Chargement d'exemples dans la console
        console.log('AFP Caption Engine v8.11 chargé');
        console.log('Commandes disponibles: on, sport on, template, check, out, 2, etc.');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AFPInterface();
});