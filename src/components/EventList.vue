<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useEventStore } from '../composables/useEventStore';
import { useToast } from '../composables/useToast';
import { useI18n } from '../composables/useI18n';
import EventCard from './EventCard.vue';
import MarkdownExporter from './MarkdownExporter.vue';

const props = defineProps<{
  sessionId: string;
}>();

const { events, loadEvents, deleteEvent, deleteAllEvents } = useEventStore();
const { showSuccess, showError } = useToast();
const { t } = useI18n();
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
    showSuccess(t('event.deleted'));
  } catch (err) {
    console.error('Failed to delete event:', err);
    showError(t('event.deleteFailed'));
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
    showSuccess(t('event.allDeleted'));
  } catch (err) {
    console.error('Failed to delete all events:', err);
    showError(t('event.allDeleteFailed'));
  }
}

function handleBulkDeleteCancelled() {
  showBulkDeleteConfirmation.value = false;
}
</script>

<template>
  <div class="space-y-4 p-4 bg-white rounded-lg shadow">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">{{ $t('event.eventLogTitle') }}</h3>

      <!-- Action buttons -->
      <div v-if="events.length > 0" class="flex items-center gap-2">
        <!-- Export button -->
        <MarkdownExporter :sessionId="sessionId" />

        <!-- Bulk delete button -->
        <div v-if="!showBulkDeleteConfirmation">
          <button
            @click="handleBulkDeleteRequest"
            class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition"
            :title="$t('event.deleteAllButton')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <div v-else class="flex gap-1">
          <button
            @click="handleBulkDeleteConfirmed"
            class="px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700 rounded transition"
            :title="$t('event.confirm')"
          >
            {{ $t('event.confirm') }}
          </button>
          <button
            @click="handleBulkDeleteCancelled"
            class="px-3 py-1 text-sm bg-gray-300 text-gray-700 hover:bg-gray-400 rounded transition"
            :title="$t('event.cancel')"
          >
            {{ $t('event.cancel') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="events.length === 0" class="text-center py-8 text-gray-500">
      {{ $t('event.noEvents') }}
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
