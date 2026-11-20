// Web Speech API Helper for KisanMitra

export class VoiceAssistant {
  private static recognition: any = null;
  private static isSpeaking: boolean = false;

  static isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  static isSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }

  static startListening(
    lang: string = 'hi-IN',
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ) {
    if (!this.isRecognitionSupported()) {
      onError('Aapke browser mein voice recognition support uplabdh nahi hai. Kripya type karein.');
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRec();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = lang === 'en' ? 'en-IN' : 'hi-IN';

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) {
        onResult(final, true);
      } else if (interim) {
        onResult(interim, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        onError('Voice samajh nahi aayi. Kripya doobara bolein ya type karein.');
      } else {
        onError('Voice samajh nahi aayi. Kripya type karke try karein.');
      }
    };

    this.recognition.onend = () => {
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.error(e);
      onError('Microphone shuru karne mein dikkat aayi.');
    }
  }

  static stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  static speak(text: string, lang: string = 'hi-IN', onStart?: () => void, onEnd?: () => void) {
    if (!this.isSynthesisSupported()) return;

    this.stopSpeaking();

    // Clean markdown, symbols, asterisks, hash signs
    const cleanText = text
      .replace(/[*_#`~[\]]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'en' ? 'en-IN' : 'hi-IN';
    utterance.rate = 0.95; // slightly slower for better farmer clarity
    utterance.pitch = 1.0;

    // Pick best Indian voice if available
    const voices = window.speechSynthesis.getVoices();
    const targetLang = lang === 'en' ? 'en' : 'hi';
    const voice = voices.find(v => v.lang.startsWith(targetLang) || v.lang.includes('IN'));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  static stopSpeaking() {
    if (this.isSynthesisSupported()) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }
}
