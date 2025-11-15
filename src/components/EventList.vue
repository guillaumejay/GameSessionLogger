<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useEventStore } from '../composables/useEventStore';
import { useToast } from '../composables/useToast';
import EventCard from './EventCard.vue';

const props = defineProps<{
  sessionId: string;
}>();

const { events, loadEvents, deleteEvent, deleteAllEvents } = useEventStore();
const { showSuccess, showError } = useToast();
const confirmingEventId = ref<string | null>(null);
const showBulkDeleteConfirmation = ref(false);

// Load events when component mounts or sessionId changes
onMounted(() => {
  loadEvents(props.sessionId);
});

watch(() => props.sessionId, (newSessionId) => {
  loadEvents(newSessionId);
  confirmingEventId.value = null; // Reset confirmation state when switching sessions
  showBulkDeleteConfirmation.value = false;
});

function handleDeleteRequested(eventId: string) {
  confirmingEventId.value = eventId;
}

async function handleDeleteConfirmed(eventId: string) {
  try {
    await deleteEvent(eventId);
    confirmingEventId.value = null;
    showSuccess('Event deleted successfully');
  } catch (err) {
    console.error('Failed to delete event:', err);
    showError('Failed to delete event');
  }
}

function handleDeleteCancelled() {
  confirmingEventId.value = null;
}

function handleBulkDeleteRequest() {
  showBulkDeleteConfirmation.value = true;
}

async function handleBulkDeleteConfirmed() {
  try {
    await deleteAllEvents(props.sessionId);
    showBulkDeleteConfirmation.value = false;
    showSuccess('All events deleted successfully');
  } catch (err) {
    console.error('Failed to delete all events:', err);
    showError('Failed to delete all events');
  }
}

function handleBulkDeleteCancelled() {
  showBulkDeleteConfirmation.value = false;
}
</script>

<template>
  <div class="space-y-4 p-4 bg-white rounded-lg shadow">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">Event Log</h3>

      <!-- Bulk delete button -->
      <div v-if="events.length > 0">
        <div v-if="!showBulkDeleteConfirmation">
          <button
            @click="handleBulkDeleteRequest"
            class="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition"
          >
            Delete All
          </button>
        </div>
        <div v-else class="flex gap-1">
          <button
            @click="handleBulkDeleteConfirmed"
            class="px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700 rounded transition"
          >
            Confirm Delete All
          </button>
          <button
            @click="handleBulkDeleteCancelled"
            class="px-3 py-1 text-sm bg-gray-300 text-gray-700 hover:bg-gray-400 rounded transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <div v-if="events.length === 0" class="text-center py-8 text-gray-500">
      No events logged yet
    </div>

    <div v-else class="space-y-2">
      <EventCard
        v-for="event in events"
        :key="event.id"
        :event="event"
        :showInlineConfirmation="confirmingEventId === event.id"
        @delete-requested="handleDeleteRequested"
        @delete-confirmed="handleDeleteConfirmed"
        @delete-cancelled="handleDeleteCancelled"
      />
    </div>
  </div>
</template>
