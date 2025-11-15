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

async function handleTagClick(tag: EventTag) {
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
      ></textarea>
    </div>
  </div>
</template>
