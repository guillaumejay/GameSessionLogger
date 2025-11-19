<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEventStore } from '../composables/useEventStore';
import { useSessionStore } from '../composables/useSessionStore';
import { useToast } from '../composables/useToast';
import { useI18n } from '../composables/useI18n';
import { type EventTag } from '../models/Event';
import { getTagsForSessionType } from '../utils/sessionTypeTags';

const props = defineProps<{
  sessionId: string;
}>();

const { createEvent } = useEventStore();
const { sessions } = useSessionStore();
const { showSuccess, showError } = useToast();
const { t } = useI18n();
const description = ref('');
const isLogging = ref(false);
const lastClickTime = ref(0);
const DEBOUNCE_MS = 300;

// Compute available tags based on session type
const availableTags = computed((): readonly EventTag[] => {
  const session = sessions.value.find(s => s.id === props.sessionId);
  if (!session) return [];
  return getTagsForSessionType(session.type);
});

async function handleTagClick(tag: EventTag) {
  // Debounce rapid clicks
  const now = Date.now();
  if (now - lastClickTime.value < DEBOUNCE_MS) {
    return;
  }
  lastClickTime.value = now;

  isLogging.value = true;
  try {
    await createEvent(props.sessionId, tag, description.value);
    description.value = ''; // Clear after successful log
    showSuccess(t('event.logSuccess'));
  } catch (err) {
    console.error('Failed to create event:', err);
    showError(t('event.logFailed'));
  } finally {
    isLogging.value = false;
  }
}

function handleKeydown(event: KeyboardEvent) {
  // Ctrl+Enter to log event with "Other" tag
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault();
    handleTagClick('Other');
  }
  // Escape to clear description
  else if (event.key === 'Escape') {
    event.preventDefault();
    description.value = '';
  }
}
</script>

<template>
  <div class="space-y-4 p-4 bg-white rounded-lg shadow">
    <h3 class="text-lg font-semibold text-gray-900">{{ $t('event.logTitle') }}</h3>

    <!-- Event tag buttons (dynamic based on session type) -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
      <button
        v-for="tag in availableTags"
        :key="tag"
        @click="handleTagClick(tag)"
        :disabled="isLogging"
        class="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 disabled:opacity-50 transition font-medium"
      >
        {{ tag }}
      </button>
    </div>

    <!-- Always-visible description field -->
    <div>
      <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
        {{ $t('event.description') }}
      </label>
      <textarea
        id="description"
        v-model="description"
        :placeholder="$t('event.descriptionPlaceholder')"
        maxlength="500"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        @keydown="handleKeydown"
      ></textarea>
      <div class="mt-1 flex justify-between text-xs text-gray-500">
        <span>{{ $t('event.tipCtrlEnter') }}</span>
        <span>{{ $t('event.characterCount', { current: description.length, max: 500 }) }}</span>
      </div>
    </div>
  </div>
</template>
