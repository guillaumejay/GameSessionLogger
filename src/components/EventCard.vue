<script setup lang="ts">
import { computed } from 'vue';
import type { Event } from '../models/Event';
import { isEventOpen, formatDuration } from '../utils/duration';

const props = defineProps<{
  event: Event;
  showInlineConfirmation?: boolean;
}>();

const emit = defineEmits<{
  'delete-requested': [eventId: string];
  'delete-confirmed': [eventId: string];
  'delete-cancelled': [];
  'close-event': [eventId: string];
}>();

const formattedTime = computed(() => {
  const date = new Date(props.event.timestamp);
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
});

// Check if event is open (no endTimestamp)
const isOpen = computed(() => isEventOpen(props.event));

// Compute duration display for closed events
const durationDisplay = computed(() => {
  if (props.event.endTimestamp) {
    return formatDuration(props.event.timestamp, props.event.endTimestamp);
  }
  return null;
});

function handleDeleteClick() {
  emit('delete-requested', props.event.id);
}

function handleConfirmDelete() {
  emit('delete-confirmed', props.event.id);
}

function handleCancelDelete() {
  emit('delete-cancelled');
}

function handleCloseClick() {
  emit('close-event', props.event.id);
}
</script>

<template>
  <div class="p-3 bg-gray-50 rounded-md border border-gray-200">
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="inline-block px-2 py-1 text-xs font-semibold rounded bg-indigo-100 text-indigo-700">
            {{ event.tag }}
          </span>
          <span class="text-sm text-gray-600">{{ formattedTime }}</span>
          <!-- Duration or Ongoing badge -->
          <span v-if="isOpen" class="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
            {{ $t('event.ongoing') }}
          </span>
          <span v-else-if="durationDisplay" class="text-xs text-gray-500">
            {{ durationDisplay }}
          </span>
          <span v-else class="text-xs text-gray-400">—</span>
        </div>
        <p v-if="event.description" class="mt-2 text-sm text-gray-900 break-words">
          {{ event.description }}
        </p>
      </div>

      <!-- Action buttons -->
      <div class="flex-shrink-0 flex items-center gap-1">
        <!-- Close button (only for open events) -->
        <button
          v-if="isOpen"
          @click="handleCloseClick"
          class="px-2 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded transition"
        >
          {{ $t('event.close', { tag: event.tag }) }}
        </button>

        <!-- Delete button / Inline confirmation -->
        <div v-if="!showInlineConfirmation">
          <button
            @click="handleDeleteClick"
            class="px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition"
            :title="$t('event.deleteButton')"
          >
            {{ $t('event.delete') }}
          </button>
        </div>
        <div v-else class="flex gap-1">
          <button
            @click="handleConfirmDelete"
            class="px-2 py-1 text-xs bg-red-600 text-white hover:bg-red-700 rounded transition"
          >
            {{ $t('event.confirm') }}
          </button>
          <button
            @click="handleCancelDelete"
            class="px-2 py-1 text-xs bg-gray-300 text-gray-700 hover:bg-gray-400 rounded transition"
          >
            {{ $t('event.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
