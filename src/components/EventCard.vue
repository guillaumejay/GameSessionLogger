<script setup lang="ts">
import { computed } from 'vue';
import type { Event } from '../models/Event';

const props = defineProps<{
  event: Event;
  showInlineConfirmation?: boolean;
}>();

const emit = defineEmits<{
  'delete-requested': [eventId: string];
  'delete-confirmed': [eventId: string];
  'delete-cancelled': [];
}>();

const formattedTime = computed(() => {
  const date = new Date(props.event.timestamp);
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
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
</script>

<template>
  <div class="p-3 bg-gray-50 rounded-md border border-gray-200">
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="inline-block px-2 py-1 text-xs font-semibold rounded bg-indigo-100 text-indigo-700">
            {{ event.tag }}
          </span>
          <span class="text-sm text-gray-600">{{ formattedTime }}</span>
        </div>
        <p v-if="event.description" class="mt-2 text-sm text-gray-900 break-words">
          {{ event.description }}
        </p>
      </div>

      <!-- Delete button / Inline confirmation -->
      <div class="flex-shrink-0">
        <div v-if="!showInlineConfirmation">
          <button
            @click="handleDeleteClick"
            class="px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition"
            title="Delete event"
          >
            Delete
          </button>
        </div>
        <div v-else class="flex gap-1">
          <button
            @click="handleConfirmDelete"
            class="px-2 py-1 text-xs bg-red-600 text-white hover:bg-red-700 rounded transition"
          >
            Confirm
          </button>
          <button
            @click="handleCancelDelete"
            class="px-2 py-1 text-xs bg-gray-300 text-gray-700 hover:bg-gray-400 rounded transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
