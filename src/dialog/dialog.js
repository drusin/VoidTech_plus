import dialogContent from './dialogContent.js';
import stateMachine from '../stateMachine.js';
import { STATES } from '../stateMachine.js';

class Dialog {
    init (dialogPlugin, scene, player) {
        this.dialogPlugin = dialogPlugin;
        this.scene = scene;
        this.player = player;
        this.dialogContainer = document.getElementById('dialog');
        this.dialogText = document.getElementById('text');
        this.buttonTemplate = document.getElementById('dialog-button');
        this.buttons = document.getElementById('buttons');
        this.currentDialog = undefined;
    }

    show(key) {
        while (this.buttons.firstChild) {
            this.buttons.firstChild.remove();
        }
        stateMachine.setState(STATES.dialog);
        this.currentDialog = dialogContent[key];
        this.dialogText.innerHTML = this.currentDialog.text;
        this.dialogContainer.style.display = 'block';
        if (this.menu) {
            this.createButtons();
        }
    }

    createButtons() {
        this.currentDialog.buttons.forEach(element => {
            const button = document.createElement('button');
            button.classList = 'dialog-button'
            button.innerHTML = element.text;
            button.addEventListener('keydown', (e) => {
                if (e.code !== 'Space') {
                    return;
                }
                e.stopPropagation();
                this.hide();
                stateMachine.setState(STATES.normal);
                if (element.action) {
                    element.action();
                }
            });
            this.buttons.appendChild(button);
        });
        this.buttons.childNodes[0].focus();
    }

    hide() {
        this.dialogContainer.style.display = 'none';
        if (this.currentDialog.action) {
            this.currentDialog.action();
        }
        this.currentDialog = undefined;
    }

    get active() {
        return this.dialogContainer.style.display === 'block';
    }

    get menu() {
        return this.currentDialog.buttons && this.currentDialog.buttons.length;
    }
}

const SINGLETON = new Dialog();

export default SINGLETON;