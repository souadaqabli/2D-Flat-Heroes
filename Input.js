export class Input {
    constructor() {
        this.keys = new Set();
        this.pressed = new Set();

        window.addEventListener("keydown", e => {
            this.keys.add(e.key);
            this.pressed.add(e.key);
        });
        window.addEventListener("keyup", e => {
            this.keys.delete(e.key);
        });
    }

    isDown(key) {
        return this.keys.has(key);
    }
    
    isPressed(key) {
        if (this.pressed.has(key)) {
            this.pressed.delete(key);   // éviter répétition
            return true;
        }
        return false;
    }
}

