<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSessionStore } from '../composables/useSessionStore';
import { useToast } from '../composables/useToast';
import { useI18n } from '../composables/useI18n';
import type { SessionType } from '../models/SessionType';

const { sessions, activeSession, createSession, setActiveSession, deleteSession } = useSessionStore();
const { showSuccess, showError, showWarning, confirm } = useToast();
const { t } = useI18n();
const newSessionName = ref('');
const isCreating = ref(false);

const nameExistsWarning = computed(() => {
  const trimmed = newSessionName.value.trim();
  if (!trimmed) return null;
  const exists = sessions.value.some(s => s.name.toLowerCase() === trimmed.toLowerCase());
  return exists ? t('session.nameExists') : null;
});

async function handleCreateSession(type: SessionType) {
  if (!newSessionName.value.trim()) {
    showError(t('session.nameRequired'));
    return;
  }

  // Show non-blocking warning for duplicate name
  if (nameExistsWarning.value) {
    showWarning(nameExistsWarning.value);
  }

  isCreating.value = true;
  try {
    const session = await createSession(newSessionName.value, type);
    await setActiveSession(session.id);
    newSessionName.value = '';
    showSuccess(t('session.created'));
  } catch (err) {
    console.error('Failed to create session:', err);
    showError(t('session.createFailed'));
  } finally {
    isCreating.value = false;
  }
}

async function handleSelectSession(sessionId: string) {
  await setActiveSession(sessionId);
}

async function handleDeleteSession(sessionId: string, sessionName: string, event: Event) {
  event.stopPropagation();

  const confirmed = await confirm(
    t('session.deleteConfirmTitle'),
    t('session.deleteConfirmMessage', { name: sessionName })
  );

  if (confirmed) {
    try {
      await deleteSession(sessionId);
      showSuccess(t('session.deleted'));
    } catch (err) {
      console.error('Failed to delete session:', err);
      showError(t('session.deleteFailed'));
    }
  }
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

function getSessionTypeIcon(type: SessionType): string {
  return type === 'RPG' ? '🎲' : '🎯';
}
</script>

<template>
  <div class="space-y-4 p-4 bg-gray-100 rounded-lg">
    <h2 class="text-xl font-bold text-gray-900">{{ $t('session.title') }}</h2>

    <!-- Create new session -->
    <div class="space-y-2">
      <div class="flex gap-2">
        <input
          v-model="newSessionName"
          type="text"
          :placeholder="$t('session.name')"
          maxlength="100"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          @click="handleCreateSession('RPG')"
          :disabled="isCreating || !newSessionName.trim()"
          class="px-3 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1"
          :title="$t('sessionType.addRpg')"
        >
          <span class="text-xl" role="img" :aria-label="$t('sessionType.rpg')">🎲</span>
        </button>
        <button
          @click="handleCreateSession('Boardgame')"
          :disabled="isCreating || !newSessionName.trim()"
          class="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1"
          :title="$t('sessionType.addBoardgame')"
        >
          <span class="text-xl" role="img" :aria-label="$t('sessionType.boardgame')">🎯</span>
        </button>
      </div>
    </div>

    <!-- Session list -->
    <div class="space-y-2">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="relative group"
      >
        <button
          @click="handleSelectSession(session.id)"
          class="w-full text-left px-3 py-2 rounded-md transition pr-10 flex items-start gap-2"
          :class="[
            activeSession?.id === session.id
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-900 hover:bg-gray-50'
          ]"
        >
          <span
            class="session-type-icon text-xl"
            :title="$t(`sessionType.${session.type.toLowerCase()}`)"
            role="img"
            :aria-label="$t(`sessionType.${session.type.toLowerCase()}`)"
          >
            {{ getSessionTypeIcon(session.type) }}
          </span>
          <div class="flex-1">
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
          </div>
        </button>
        <button
          @click="handleDeleteSession(session.id, session.name, $event)"
          class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition"
          :class="[activeSession?.id === session.id ? 'hover:bg-red-600 hover:text-white' : '']"
          :title="$t('session.deleteConfirmTitle')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
