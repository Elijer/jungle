import * as Tone from "tone";

export class SomeSynth {
  synth: Tone.Synth; // Add the 'synth' property
  duration: string;
  note: string;

  constructor() {
    this.synth = new Tone.Synth().toDestination();
    this.duration = "18n"
    this.note = "C3"
  }

  playNote(detune: number) {
    this.synth.set({ detune: detune});
    this.synth.triggerAttackRelease(this.note, this.duration);
  }

  setVolume(volume: number) {
    this.synth.volume.value = volume
  }

  playNoteAtVolume(detune: number, volume: number) {
    this.synth.set({ detune: detune});
    this.synth.volume.value = volume
    this.synth.triggerAttackRelease(this.note, this.duration);
  }

  initializeAudio() {
    Tone.start()
  }
}