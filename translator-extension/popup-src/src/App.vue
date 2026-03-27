<template>
  <div class="sidebar">

    <!-- Ambient glow -->
    <div class="orb orb-1" aria-hidden="true" />
    <div class="orb orb-2" aria-hidden="true" />

    <!-- Header -->
    <header class="sidebar-header">
      <div class="brand">
        <div class="brand-icon-ring">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
            <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
          </svg>
        </div>
        <span class="brand-name">VoxaBridge</span>
        <span class="brand-badge">LIVE</span>
      </div>
      <div class="header-actions">
        <button class="btn-icon" @click="toggleLocale" :title="t('btn.toggleLang')">
          {{ locale === 'vi' ? 'EN' : 'VI' }}
        </button>
        <button v-if="store.subtitles.length > 0" class="btn-icon" @click="store.clearSubtitles" title="Clear">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>
    </header>

    <!-- Language Bar -->
    <div class="lang-bar">
      <div class="lang-field" :class="{ disabled: store.isTranslating }">
        <label class="lang-label">{{ t('lang.source') }}</label>
        <select v-model="store.sourceLang" class="lang-select" :disabled="store.isTranslating" @change="store.setSourceLang(store.sourceLang)">
          <option v-for="opt in langOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <svg class="lang-arrow" viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
      </div>

      <button class="swap-btn" :disabled="store.isTranslating" @click="store.swapLangs" aria-label="Swap">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
          <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>
        </svg>
      </button>

      <div class="lang-field" :class="{ disabled: store.isTranslating }">
        <label class="lang-label">{{ t('lang.target') }}</label>
        <select v-model="store.targetLang" class="lang-select" :disabled="store.isTranslating" @change="store.setTargetLang(store.targetLang)">
          <option v-for="opt in langOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <svg class="lang-arrow" viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
      </div>
    </div>

    <!-- Content -->
    <div class="content-area" ref="contentRef">

      <Transition name="fade">
        <div v-if="store.subtitles.length === 0" class="empty-state">
          <template v-if="store.isTranslating">
            <div class="wave-bars">
              <span v-for="i in 7" :key="i" class="bar" :style="`--i:${i}`" />
            </div>
            <p class="empty-hint">{{ t('empty.listening') }}</p>
          </template>
          <template v-else>
            <div class="idle-ring">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
              </svg>
            </div>
            <p class="empty-hint">{{ t('empty.idle') }}</p>
          </template>
        </div>
      </Transition>

      <TransitionGroup name="entry" tag="div" class="entries-list">
        <div
          v-for="(item, idx) in store.subtitles"
          :key="idx"
          class="subtitle-entry"
          :class="{ interim: !item.isFinal }"
        >
          <!-- Original -->
          <div class="original-row">
            <p class="original-text">{{ item.original }}</p>
            <span v-if="!item.isFinal" class="pulse-dots">
              <i /><i /><i />
            </span>
          </div>

          <!-- Translated: word-by-word reveal for final, shimmer for pending -->
          <p v-if="item.isFinal && item.translated" class="translated-text">
            <span
              v-for="(word, wi) in item.translated.split(' ')"
              :key="wi"
              class="word-reveal"
              :style="`--d:${wi * 0.055}s`"
            >{{ word }}&nbsp;</span>
          </p>
          <p v-else-if="!item.isFinal && item.translated" class="translated-interim">
            {{ item.translated }}
          </p>
          <div v-else-if="!item.isFinal" class="shimmer-block">
            <div class="shimmer-line" style="width:80%" />
            <div class="shimmer-line" style="width:52%" />
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="status-row">
        <span class="status-dot" :class="{ active: store.isTranslating }" />
        <span class="status-label">{{ store.isTranslating ? t('status.active') : t('status.idle') }}</span>
      </div>

      <Transition name="ctrl" mode="out-in">
        <button v-if="!store.isTranslating" key="start" class="ctrl-btn ctrl-start" @click="store.startTranslation">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
          {{ t('btn.start') }}
        </button>
        <button v-else key="stop" class="ctrl-btn ctrl-stop" @click="store.stopTranslation">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
          {{ t('btn.stop') }}
        </button>
      </Transition>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useI18n } from './i18n/index.js'
import { useTranslationStore } from './stores/translation.js'

const { t, locale } = useI18n()
const store = useTranslationStore()
const contentRef = ref(null)

const langOptions = computed(() => [
  { value: 'en', label: t('languages.en') },
  { value: 'vi', label: t('languages.vi') },
  { value: 'ja', label: t('languages.ja') },
  { value: 'ko', label: t('languages.ko') },
  { value: 'zh', label: t('languages.zh') }
])

function toggleLocale() {
  locale.value = locale.value === 'vi' ? 'en' : 'vi'
}

watch(() => store.subtitles.length, async () => {
  await nextTick()
  if (contentRef.value) contentRef.value.scrollTop = contentRef.value.scrollHeight
})

store.init()
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  width: 360px; height: 580px;
  background: #080c12;
  overflow: hidden;
  font-family: "Inter", "SF Pro Display", "Segoe UI", system-ui, sans-serif;
}

/* ── Root ── */
.sidebar {
  width: 360px; height: 580px;
  background: linear-gradient(160deg, #080c12 0%, #0a0f18 100%);
  color: #e2e8f0;
  display: flex; flex-direction: column;
  overflow: hidden; position: relative;
}

/* ── Ambient orbs ── */
.orb {
  position: absolute; border-radius: 50%;
  pointer-events: none; z-index: 0;
}
.orb-1 {
  width: 240px; height: 240px;
  background: radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%);
  filter: blur(50px);
  top: -80px; left: -60px;
}
.orb-2 {
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%);
  filter: blur(50px);
  bottom: -50px; right: -40px;
}

/* ── Header ── */
.sidebar-header {
  display: flex; align-items: center; justify-content: space-between;
  height: 46px; padding: 0 14px;
  background: rgba(255,255,255,0.02);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0; position: relative; z-index: 2;
}

.brand { display: flex; align-items: center; gap: 9px; }

.brand-icon-ring {
  width: 28px; height: 28px; border-radius: 9px;
  background: linear-gradient(135deg, #0891b2, #0ea5e9);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 16px rgba(6,182,212,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
  color: #fff;
}

.brand-name {
  font-size: 14px; font-weight: 700; letter-spacing: 0.3px;
  background: linear-gradient(90deg, #7dd3fc, #e0f2fe);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

.brand-badge {
  font-size: 8.5px; font-weight: 700; letter-spacing: 1px;
  padding: 2px 7px; border-radius: 20px;
  background: rgba(6,182,212,0.12);
  border: 1px solid rgba(6,182,212,0.28);
  color: #67e8f9;
}

.header-actions { display: flex; align-items: center; gap: 4px; }

.btn-icon {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 8px;
  color: rgba(255,255,255,0.35);
  font-size: 10px; font-weight: 700; font-family: inherit;
  cursor: pointer; transition: all 0.15s;
}
.btn-icon:hover {
  color: #e2e8f0;
  background: rgba(6,182,212,0.12);
  border-color: rgba(6,182,212,0.3);
}

/* ── Language bar ── */
.lang-bar {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 12px;
  background: rgba(255,255,255,0.015);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  flex-shrink: 0; position: relative; z-index: 2;
}

.lang-field {
  position: relative; flex: 1; min-width: 0;
  border-radius: 10px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.lang-field:hover:not(.disabled) {
  border-color: rgba(6,182,212,0.35);
  box-shadow: 0 0 0 3px rgba(6,182,212,0.07);
}
.lang-field:focus-within:not(.disabled) {
  border-color: rgba(6,182,212,0.5);
  box-shadow: 0 0 0 3px rgba(6,182,212,0.1);
}
.lang-field.disabled { opacity: 0.3; pointer-events: none; }

.lang-label {
  display: block; font-size: 9px; letter-spacing: 0.6px;
  text-transform: uppercase; color: rgba(255,255,255,0.3);
  padding: 5px 10px 0; line-height: 1; pointer-events: none;
}
.lang-select {
  display: block; width: 100%; background: transparent;
  border: none; outline: none; color: #e2e8f0;
  font-size: 12px; font-weight: 500; font-family: inherit;
  padding: 2px 22px 5px 10px; cursor: pointer;
  appearance: none; -webkit-appearance: none;
}
.lang-select option { background: #111827; }
.lang-arrow {
  position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
  color: rgba(255,255,255,0.2); pointer-events: none;
}

.swap-btn {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; flex-shrink: 0;
  border-radius: 50%;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  cursor: pointer; color: rgba(255,255,255,0.25);
  transition: all 0.2s;
}
.swap-btn:hover:not(:disabled) {
  color: #67e8f9;
  background: rgba(6,182,212,0.1);
  border-color: rgba(6,182,212,0.3);
  transform: rotate(180deg);
}
.swap-btn:disabled { opacity: 0.2; cursor: not-allowed; }

/* ── Content area ── */
.content-area {
  flex: 1; overflow-y: auto; padding: 10px 11px;
  scroll-behavior: smooth; position: relative; z-index: 1;
}
.content-area::-webkit-scrollbar { width: 3px; }
.content-area::-webkit-scrollbar-track { background: transparent; }
.content-area::-webkit-scrollbar-thumb { background: rgba(6,182,212,0.25); border-radius: 3px; }

/* ── Empty state ── */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 100%; min-height: 200px; gap: 16px;
}

/* Waveform for listening */
.wave-bars {
  display: flex; align-items: flex-end; gap: 3px; height: 36px;
}
.bar {
  width: 3px; border-radius: 3px;
  background: linear-gradient(180deg, #22d3ee, #0ea5e9);
  animation: wave 1.1s ease-in-out infinite;
  animation-delay: calc((var(--i) - 1) * 0.1s);
}
@keyframes wave {
  0%,100% { height: 5px; opacity: 0.3; }
  50%      { height: 30px; opacity: 1; }
}

.idle-ring {
  width: 52px; height: 52px; border-radius: 50%;
  background: rgba(6,182,212,0.06);
  border: 1px solid rgba(6,182,212,0.12);
  display: flex; align-items: center; justify-content: center;
  color: rgba(6,182,212,0.3);
}

.empty-hint { font-size: 12px; color: rgba(255,255,255,0.25); }

/* ── Subtitle entries ── */
.entries-list { display: flex; flex-direction: column; gap: 7px; }

.subtitle-entry {
  padding: 11px 13px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: border-color 0.3s;
}
.subtitle-entry.interim {
  background: rgba(6,182,212,0.04);
  border-color: rgba(6,182,212,0.18);
  animation: card-breathe 2.5s ease-in-out infinite;
}
@keyframes card-breathe {
  0%,100% { border-color: rgba(6,182,212,0.15); }
  50%      { border-color: rgba(6,182,212,0.35); }
}

.original-row {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 6px;
  margin-bottom: 7px;
}
.original-text {
  font-size: 11px; color: rgba(255,255,255,0.3);
  line-height: 1.5; font-style: italic; flex: 1;
}

/* Pulse dots for interim */
.pulse-dots {
  display: flex; align-items: center; gap: 3px; padding-top: 1px; flex-shrink: 0;
}
.pulse-dots i {
  display: block; width: 4px; height: 4px; border-radius: 50%;
  background: #22d3ee; font-style: normal;
  animation: pdot 1.4s ease-in-out infinite;
}
.pulse-dots i:nth-child(2) { animation-delay: 0.18s; opacity: 0.7; }
.pulse-dots i:nth-child(3) { animation-delay: 0.36s; opacity: 0.5; }
@keyframes pdot {
  0%,80%,100% { transform: scale(0.7); opacity: 0.35; }
  40%          { transform: scale(1); opacity: 1; }
}

/* Translated text - final: word-by-word reveal */
.translated-text {
  font-size: 14px; font-weight: 500;
  color: rgba(255,255,255,0.88);
  line-height: 1.65;
  word-break: break-word;
  overflow-wrap: break-word;
}
.word-reveal {
  display: inline;
  opacity: 0;
  animation: word-in 0.25s ease forwards;
  animation-delay: var(--d);
}
@keyframes word-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Translated interim (has text but not final) */
.translated-interim {
  font-size: 14px; font-weight: 500;
  color: rgba(255,255,255,0.5);
  line-height: 1.65;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* Shimmer for no translation yet */
.shimmer-block { display: flex; flex-direction: column; gap: 5px; }
.shimmer-line {
  height: 9px; border-radius: 4px;
  background: linear-gradient(90deg,
    rgba(255,255,255,0.03) 0%,
    rgba(6,182,212,0.12) 45%,
    rgba(255,255,255,0.03) 90%
  );
  background-size: 250% 100%;
  animation: shimmer 1.8s linear infinite;
}
@keyframes shimmer {
  0%   { background-position: 250% 0; }
  100% { background-position: -250% 0; }
}

/* ── Footer ── */
.footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px 13px;
  background: rgba(255,255,255,0.02);
  border-top: 1px solid rgba(255,255,255,0.05);
  flex-shrink: 0; gap: 10px; position: relative; z-index: 2;
}

.status-row { display: flex; align-items: center; gap: 7px; flex: 1; }

.status-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: rgba(255,255,255,0.12); flex-shrink: 0;
  transition: background 0.3s;
}
.status-dot.active {
  background: #34d399;
  animation: sdot 1.6s ease-in-out infinite;
}
@keyframes sdot {
  0%   { box-shadow: 0 0 0 0 rgba(52,211,153,0.4); }
  60%  { box-shadow: 0 0 0 6px rgba(52,211,153,0); }
  100% { box-shadow: 0 0 0 0 rgba(52,211,153,0); }
}

.status-label { font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 500; }

/* ── Control buttons ── */
.ctrl-btn {
  display: flex; align-items: center; gap: 6px;
  height: 34px; padding: 0 18px;
  border: none; border-radius: 999px;
  font-size: 12px; font-weight: 600;
  font-family: inherit; cursor: pointer;
  white-space: nowrap; flex-shrink: 0;
  transition: all 0.15s; letter-spacing: 0.02em;
}
.ctrl-start {
  background: linear-gradient(135deg, #0891b2 0%, #0ea5e9 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(6,182,212,0.3), inset 0 1px 0 rgba(255,255,255,0.15);
}
.ctrl-start:hover {
  box-shadow: 0 4px 22px rgba(6,182,212,0.5);
  transform: translateY(-1px);
}
.ctrl-stop {
  background: rgba(239,68,68,0.1);
  color: #fca5a5;
  border: 1px solid rgba(239,68,68,0.25);
}
.ctrl-stop:hover { background: rgba(239,68,68,0.18); border-color: rgba(239,68,68,0.4); }
.ctrl-btn:active { transform: scale(0.96) !important; }

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.entry-enter-active { transition: opacity 0.3s, transform 0.3s; }
.entry-enter-from   { opacity: 0; transform: translateY(10px); }

.ctrl-enter-active, .ctrl-leave-active { transition: opacity 0.15s, transform 0.15s; }
.ctrl-enter-from, .ctrl-leave-to { opacity: 0; transform: scale(0.9); }
</style>
