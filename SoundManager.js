export class SoundManager {
    constructor() {
        // Vérifier si Tone.js est chargé
        if (typeof Tone === 'undefined') {
            console.error('Tone.js n\'est pas chargé ! Ajoutez la balise script dans index.html');
            this.enabled = false;
            return;
        }
        
        this.enabled = true;
        console.log('Tone.js chargé !');
        
        // === SYNTHÉS MAGIQUES ET DOUX ===
        
        // Pour les sorts - son cristallin
        this.bellSynth = new Tone.FMSynth({
            harmonicity: 8,
            modulationIndex: 2,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.001, decay: 2, sustain: 0.1, release: 2 },
            modulation: { type: 'square' },
            modulationEnvelope: { attack: 0.002, decay: 0.2, sustain: 0, release: 0.2 }
        }).toDestination();
        
        // Pour les mélodies - son doux
        this.melodySynth = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 0.8 }
        }).toDestination();
        
        // Reverb pour effet magique
        this.reverb = new Tone.Reverb({
            decay: 3,
            preDelay: 0.01
        }).toDestination();
        
        // Sons avec reverb
        this.magicSynth = new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.5 }
        }).connect(this.reverb);
        
        // Musique de fond - ambient magique
        this.bgSynth1 = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 2, decay: 1, sustain: 0.8, release: 3 }
        }).toDestination();
        
        this.bgSynth2 = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 2, decay: 1, sustain: 0.8, release: 3 }
        }).toDestination();
        
        this.bgSynth3 = new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 3, decay: 2, sustain: 0.6, release: 4 }
        }).toDestination();
        
        // Volumes très doux
        this.bellSynth.volume.value = -15;
        this.melodySynth.volume.value = -12;
        this.magicSynth.volume.value = -14;
        this.bgSynth1.volume.value = -25;
        this.bgSynth2.volume.value = -25;
        this.bgSynth3.volume.value = -28;
        
        this.isMusicPlaying = false;
        this.musicLoop = null;
    }
    
    async start() {
        if (!this.enabled) return;
        await Tone.start();
        console.log('Audio magique démarré !');
    }
    
    // === TIR DE SORT  ===
    playSpellSound() {
        if (!this.enabled) return;
        this.start();
        
        const now = Tone.now();
        // Son très doux de "whoosh" magique
        this.magicSynth.triggerAttackRelease('E5', '32n', now);
        this.magicSynth.triggerAttackRelease('G5', '32n', now + 0.02);
    }
    
    // === COLLISION ===
    playHitSound() {
        if (!this.enabled) return;
        this.start();
        
        const now = Tone.now();

        this.magicSynth.triggerAttackRelease('G4', '16n', now);
        this.magicSynth.triggerAttackRelease('E4', '16n', now + 0.05);
    }
    
    // === MORT D'ENNEMI ===
    playEnemyDeathSound() {
        if (!this.enabled) return;
        this.start();
        
        const now = Tone.now();
        
        this.bellSynth.triggerAttackRelease('E4', '16n', now);
        this.bellSynth.triggerAttackRelease('G4', '16n', now + 0.08);
        this.bellSynth.triggerAttackRelease('B4', '16n', now + 0.16);
        this.bellSynth.triggerAttackRelease('E5', '8n', now + 0.24); // Note finale brillante
        
        // Effet magique de disparition
        this.magicSynth.triggerAttackRelease('C5', '4n', now + 0.3);
    }
    
    // === DASH ===
    playDashSound() {
        if (!this.enabled) return;
        this.start();
        
        const now = Tone.now();
        
        this.bellSynth.triggerAttackRelease('E4', '16n', now);
        this.bellSynth.triggerAttackRelease('A4', '16n', now + 0.03);
    }
    
    // === LEVEL UP  ===
    playLevelUpSound() {
        if (!this.enabled) return;
        this.start();
        
        const now = Tone.now();
        // Arpège majeur doux : C E G C
        const notes = ['C4', 'E4', 'G4', 'C5'];
        notes.forEach((note, i) => {
            this.melodySynth.triggerAttackRelease(note, '4n', now + i * 0.15);
        });
        
        // Cloche finale
        this.bellSynth.triggerAttackRelease('E5', '2n', now + 0.6);
    }
    
    // === GAME OVER  ===
    playGameOverSound() {
        if (!this.enabled) return;
        this.start();
        
        //  arrêter la musique de fond
        this.stopBackgroundMusic();
        
        const now = Tone.now();
        // Descente dramatique avec pause
        const notes = ['A4', 'G4', 'F4', 'E4'];
        notes.forEach((note, i) => {
            this.melodySynth.triggerAttackRelease(note, '4n', now + i * 0.3);
        });
        
        // Note finale grave et longue
        setTimeout(() => {
            this.melodySynth.triggerAttackRelease('A2', '1n', Tone.now());
        }, 1200);
    }
    
    // === START ===
    playStartSound() {
        if (!this.enabled) return;
        this.start();
        
        const now = Tone.now();
        // Arpège montant magique
        this.bellSynth.triggerAttackRelease('C4', '8n', now);
        this.bellSynth.triggerAttackRelease('E4', '8n', now + 0.1);
        this.bellSynth.triggerAttackRelease('G4', '8n', now + 0.2);
        this.bellSynth.triggerAttackRelease('C5', '4n', now + 0.3);
    }
    
    // === MUSIQUE DE FOND  ===
    playBackgroundMusic() {
        if (!this.enabled || this.isMusicPlaying) return;
        this.start();
        
        // Notes mystérieuses
        const bass = ['A2', 'E2', 'F2', 'G2']; // Basse
        const mid = ['C4', 'E4', 'F4', 'G4'];  // Milieu
        const high = ['A4', 'C5', 'E5', 'D5']; // Aigu
        
        let index = 0;
        
        this.musicLoop = new Tone.Loop((time) => {
            const i = index % bass.length;
            
            // Basse très lente et douce
            this.bgSynth1.triggerAttackRelease(bass[i], '1n', time);
            
            // Milieu avec délai
            this.bgSynth2.triggerAttackRelease(mid[i], '2n', time + 0.5);
            
            // Aigu occasionnel
            if (index % 2 === 0) {
                this.bgSynth3.triggerAttackRelease(high[i], '2n', time + 1);
            }
            
            index++;
        }, '2n'); // Toutes les 2 noires = très lent
        
        this.musicLoop.start(0);
        Tone.Transport.bpm.value = 60; // 60 BPM = très calme
        Tone.Transport.start();
        this.isMusicPlaying = true;
        
        console.log('Musique magique ambient lancée');
    }
    
    stopBackgroundMusic() {
        if (!this.enabled) return;
        
        if (this.musicLoop) {
            this.musicLoop.stop();
            Tone.Transport.stop();
            this.musicLoop = null;
        }
        this.isMusicPlaying = false;
        
        console.log('Musique arrêtée');
    }
    
    // === CONTRÔLES ===
    setMasterVolume(db) {
        if (!this.enabled) return;
        Tone.Destination.volume.value = db;
    }
    
    muteAll() {
        if (!this.enabled) return;
        Tone.Destination.mute = true;
    }
    
    unmuteAll() {
        if (!this.enabled) return;
        Tone.Destination.mute = false;
    }
}