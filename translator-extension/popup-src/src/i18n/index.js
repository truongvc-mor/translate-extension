import { ref, computed } from 'vue'

const locale = ref('vi')

const messages = {
  vi: {
    'app.name': 'VoxaBridge',
    'lang.source': 'Ngôn ngữ nói',
    'lang.target': 'Dịch sang',
    'languages.en': 'Tiếng Anh',
    'languages.vi': 'Tiếng Việt',
    'languages.ja': 'Tiếng Nhật',
    'languages.ko': 'Tiếng Hàn',
    'languages.zh': 'Tiếng Trung',
    'status.idle': 'Sẵn sàng',
    'status.active': 'Đang dịch',
    'btn.start': 'Bắt đầu dịch',
    'btn.stop': 'Dừng lại',
    'btn.toggleLang': 'Đổi ngôn ngữ',
    'empty.idle': 'Nhấn Start để bắt đầu dịch',
    'empty.listening': 'Đang lắng nghe...'
  },
  en: {
    'app.name': 'VoxaBridge',
    'lang.source': 'Source language',
    'lang.target': 'Translate to',
    'languages.en': 'English',
    'languages.vi': 'Vietnamese',
    'languages.ja': 'Japanese',
    'languages.ko': 'Korean',
    'languages.zh': 'Chinese',
    'status.idle': 'Ready',
    'status.active': 'Translating',
    'btn.start': 'Start Translation',
    'btn.stop': 'Stop',
    'btn.toggleLang': 'Toggle language',
    'empty.idle': 'Press Start to begin translation',
    'empty.listening': 'Listening...'
  }
}

export function useI18n() {
  const t = computed(() => key => messages[locale.value]?.[key] ?? key)
  return { t: key => t.value(key), locale }
}
