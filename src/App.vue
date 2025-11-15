<script setup lang="ts">
import { onMounted } from 'vue';
import { useSessionStore } from './composables/useSessionStore';
import SessionSelector from './components/SessionSelector.vue';
import EventLogger from './components/EventLogger.vue';
import EventList from './components/EventList.vue';
import MarkdownExporter from './components/MarkdownExporter.vue';

const { activeSession, loadSessions } = useSessionStore();

onMounted(async () => {
  await loadSessions();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <h1 class="text-3xl font-bold text-center mb-6 text-gray-900">Game Session Logger</h1>

    <div class="max-w-6xl mx-auto grid gap-6 md:grid-cols-3">
      <!-- Left column: Session selector -->
      <div class="md:col-span-1">
        <SessionSelector />
      </div>

      <!-- Right column: Event logging -->
      <div class="md:col-span-2 space-y-6">
        <div v-if="activeSession">
          <EventLogger :sessionId="activeSession.id" />
          <MarkdownExporter :sessionId="activeSession.id" class="mt-4" />
          <EventList :sessionId="activeSession.id" class="mt-6" />
        </div>
        <div v-else class="text-center text-gray-500 py-12 bg-white rounded-lg shadow">
          Select or create a session to start logging events
        </div>
      </div>
    </div>
  </div>
</template>
