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
  <div class="p-4 bg-white rounded-lg shadow">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">Export</h3>

      <button
        @click="handleCopyToClipboard"
        :disabled="!hasEvents || isCopying"
        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        :title="!hasEvents ? 'No events to copy' : 'Copy events as markdown table'"
      >
        <span v-if="isCopying">Copying...</span>
        <span v-else>Copy to Clipboard</span>
      </button>
    </div>

    <!-- Empty state hint -->
    <div v-if="!hasEvents" class="mt-2 text-xs text-gray-500">
      No events to copy. Log some events first.
    </div>
  </div>
</template>
