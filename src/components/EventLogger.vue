<script setup lang="ts">
import { ref } from 'vue';
import { useEventStore } from '../composables/useEventStore';
import { useToast } from '../composables/useToast';
import { EVENT_TAGS, type EventTag } from '../models/Event';

const props = defineProps<{
  sessionId: string;
}>();

const { createEvent } = useEventStore();
const { showSuccess, showError } = useToast();
const description = ref('');
const isLogging = ref(false);
const lastClickTime = ref(0);
const DEBOUNCE_MS = 300;

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
    showSuccess('Event logged successfully!');
  } catch (err) {
    console.error('Failed to create event:', err);
    showError('Failed to log event');
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
    <h3 class="text-lg font-semibold text-gray-900">Log Event</h3>

    <!-- Event tag buttons -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
      <button
        v-for="tag in EVENT_TAGS"
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
        Description (optional)
      </label>
      <textarea
        id="description"
        v-model="description"
        placeholder="Add optional description..."
        maxlength="500"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        @keydown="handleKeydown"
      ></textarea>
      <div class="mt-1 flex justify-between text-xs text-gray-500">
        <span>Tip: Ctrl+Enter to log, Esc to clear</span>
        <span>{{ description.length }}/500 characters</span>
      </div>
    </div>
  </div>
</template>
