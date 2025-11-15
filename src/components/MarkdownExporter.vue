<script setup lang="ts">
import { computed } from 'vue';
import { useEventStore } from '../composables/useEventStore';
import { useClipboard } from '../composables/useClipboard';
import { useToast } from '../composables/useToast';
import { formatEventsAsMarkdownTable } from '../utils/markdown';

defineProps<{
  sessionId: string;
}>();

const { events } = useEventStore();
const { copyToClipboard, isCopying } = useClipboard();
const { showSuccess, showError } = useToast();

const hasEvents = computed(() => events.value.length > 0);

async function handleCopyToClipboard() {
  if (!hasEvents.value) {
    return;
  }

  try {
    const markdownTable = formatEventsAsMarkdownTable(events.value);
    await copyToClipboard(markdownTable);
    showSuccess('Copied to clipboard!');
  } catch (err) {
    const errorMessage = err instanceof Error
      ? err.message === 'Clipboard API not supported'
        ? 'Clipboard access not supported in your browser'
        : 'Clipboard access denied. Please check browser permissions.'
      : 'Failed to copy to clipboard';

    showError(errorMessage);
  }
}
</script>

<template>
  <button
    @click="handleCopyToClipboard"
    :disabled="!hasEvents || isCopying"
    class="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
    :title="!hasEvents ? 'No events to copy' : 'Copy events as markdown table'"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
    </svg>
  </button>
</template>
