import { defineStore } from 'pinia'

const isChromeExt = typeof chrome !== 'undefined' && !!chrome.runtime?.sendMessage

export const useTranslationStore = defineStore('translation', {
  state: () => ({
    isTranslating: false,
    sourceLang: 'en',
    targetLang: 'vi',
    subtitles: []   // { original, translated, isFinal }
  }),

  actions: {
    async init() {
      if (!isChromeExt) return

      // Load saved language preferences
      await new Promise(resolve => {
        chrome.storage.local.get(['sourceLang', 'targetLang'], data => {
          if (data.sourceLang) this.sourceLang = data.sourceLang
          if (data.targetLang) this.targetLang = data.targetLang
          resolve()
        })
      })

      // Sync translating state from background
      chrome.runtime.sendMessage({ action: 'getState' }, response => {
        if (response) this.isTranslating = response.isTranslating
      })

      // Listen for subtitle messages forwarded by background
      chrome.runtime.onMessage.addListener((msg) => {
        if (msg.action === 'showSubtitle') {
          this._handleSubtitle(msg)
        }
      })
    },

    _handleSubtitle({ original, translated, isFinal }) {
      if (!isFinal) {
        // Update or add interim entry at the end
        const last = this.subtitles[this.subtitles.length - 1]
        if (last && !last.isFinal) {
          last.original = original
          last.translated = translated || last.translated
        } else {
          this.subtitles.push({ original, translated: translated || '', isFinal: false })
        }
      } else {
        // Replace last interim with final
        const last = this.subtitles[this.subtitles.length - 1]
        if (last && !last.isFinal) {
          last.original = original
          last.translated = translated || last.translated
          last.isFinal = true
        } else {
          this.subtitles.push({ original, translated: translated || '', isFinal: true })
        }
        // Keep only last 30 entries
        if (this.subtitles.length > 30) this.subtitles.splice(0, this.subtitles.length - 30)
      }
    },

    setSourceLang(lang) {
      this.sourceLang = lang
      if (isChromeExt) chrome.storage.local.set({ sourceLang: lang })
    },

    setTargetLang(lang) {
      this.targetLang = lang
      if (isChromeExt) chrome.storage.local.set({ targetLang: lang })
    },

    swapLangs() {
      const tmp = this.sourceLang
      this.sourceLang = this.targetLang
      this.targetLang = tmp
      if (isChromeExt) {
        chrome.storage.local.set({ sourceLang: this.sourceLang, targetLang: this.targetLang })
      }
    },

    startTranslation() {
      if (isChromeExt) {
        chrome.runtime.sendMessage({
          action: 'start',
          sourceLang: this.sourceLang,
          targetLang: this.targetLang
        })
      }
      this.isTranslating = true
    },

    stopTranslation() {
      if (isChromeExt) {
        chrome.runtime.sendMessage({ action: 'stop' })
      }
      this.isTranslating = false
    },

    clearSubtitles() {
      this.subtitles = []
    }
  }
})
