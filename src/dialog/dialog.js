import dialogContent from './dialogContent.js';
import stateMachine from '../stateMachine.js';
import { STATES } from '../stateMachine.js';

import lisa from '../assets/Lisa-talking.gif';
import lisaTape from '../assets/Lisa-talking-video.gif';
import dave from '../assets/Dave-talking.gif';

const speakerImages = {
    lisa,
    dave,
    lisaTape
}

class Dialog {
    init (dialogPlugin, scene, player) {
        this.dialogPlugin = dialogPlugin;
        this.scene = scene;
        this.player = player;
        this.dialogContainer = document.getElementById('dialog');
        this.dialogText = document.getElementById('text');
        this.buttonTemplate = document.getElementById('dialog-button');
        this.buttons = document.getElementById('buttons');
        this.speaker = document.getElementById('speaker');
        this.currentDialog = undefined;
        this.trigger = undefined;
    }

    show(key, trigger) {
        if (this.player._isMoving(this.player.sprite.body.velocity)) {
            this.player.sprite.setVelocityX(0);
            this.player.sprite.setVelocityY(0);
        }
        while (this.buttons.firstChild) {
            this.buttons.firstChild.remove();
        }
        if (!(key in dialogContent)) {
            console.warn(`No dialog defined for key '${key}'…`);
            return;
        }
        stateMachine.setState(STATES.dialog);
        this.currentDialog = dialogContent[key];
        while (this.currentDialog.proxyFor) {
            this.currentDialog = dialogContent[this.currentDialog.proxyFor];
        }
        this.trigger = trigger;
        this.dialogText.innerHTML = this.currentDialog.text;
        this.dialogContainer.style.display = 'block';
        if (this.menu) {
            this.createButtons();
        }
        if (this.speaker) {
            this.createSpeaker()
        }
    }

    createSpeaker() {
        const img = document.createElement('img');
        img.src = speakerImages[this.currentDialog.speaker];
        this.speaker.appendChild(img);
    }

    createButtons() {
        this.currentDialog.buttons.forEach(element => {
            const button = document.createElement('button');
            button.classList = 'dialog-button'
            button.innerHTML = element.text;
            button.addEventListener('keydown', (e) => {
                if (e.code !== 'Space' && e.code !== 'Enter') {
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
        const todo = this.currentDialog.action;
        const trigger = this.trigger;
        this.dialogContainer.style.display = 'none';
        this.currentDialog = undefined;
        this.trigger = undefined;
        this.speaker.innerHTML = '';
        if (todo) {
            todo(trigger);
        }
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