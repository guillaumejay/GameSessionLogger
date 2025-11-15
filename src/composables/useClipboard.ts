import { ref } from 'vue';

export function useClipboard() {
  const isCopying = ref(false);
  const error = ref<string | null>(null);

  async function copyToClipboard(text: string): Promise<void> {
    error.value = null;
    isCopying.value = true;

    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not supported');
      }

      await navigator.clipboard.writeText(text);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to copy to clipboard';
      throw err;
    } finally {
      isCopying.value = false;
    }
  }

  return {
    isCopying,
    error,
    copyToClipboard
  };
}
