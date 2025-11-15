<script setup lang="ts">
import { ref } from 'vue';
import { useSessionStore } from '../composables/useSessionStore';
import { useToast } from '../composables/useToast';

const { sessions, activeSession, createSession, setActiveSession } = useSessionStore();
const { showSuccess, showError } = useToast();
const newSessionName = ref('');
const isCreating = ref(false);

async function handleCreateSession() {
  if (!newSessionName.value.trim()) return;

  isCreating.value = true;
  try {
    const session = await createSession(newSessionName.value);
    await setActiveSession(session.id);
    newSessionName.value = '';
    showSuccess('Session created successfully');
  } catch (err) {
    console.error('Failed to create session:', err);
    showError('Failed to create session');
  } finally {
    isCreating.value = false;
  }
}

async function handleSelectSession(sessionId: string) {
  await setActiveSession(sessionId);
}

function formatSessionDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}
</script>

<template>
  <div class="space-y-4 p-4 bg-gray-100 rounded-lg">
    <h2 class="text-xl font-bold text-gray-900">Sessions</h2>

    <!-- Create new session -->
    <div class="flex gap-2">
      <input
        v-model="newSessionName"
        type="text"
        placeholder="Session name"
        maxlength="100"
        class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        @keyup.enter="handleCreateSession"
      />
      <button
        @click="handleCreateSession"
        :disabled="isCreating || !newSessionName.trim()"
        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Create
      </button>
    </div>

    <!-- Session list -->
    <div class="space-y-2">
      <button
        v-for="session in sessions"
        :key="session.id"
        @click="handleSelectSession(session.id)"
        class="w-full text-left px-3 py-2 rounded-md transition"
        :class="[
          activeSession?.id === session.id
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-900 hover:bg-gray-50'
        ]"
      >
        <div class="font-medium">{{ session.name }}</div>
        <div
          class="text-xs mt-0.5"
          :class="[
            activeSession?.id === session.id
              ? 'text-blue-100'
              : 'text-gray-500'
          ]"
        >
          {{ formatSessionDate(session.createdAt) }}
        </div>
      </button>
    </div>
  </div>
</template>
