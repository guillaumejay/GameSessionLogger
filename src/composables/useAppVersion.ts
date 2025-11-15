import { ref } from 'vue';
import packageJson from '../../package.json';

const version = ref(packageJson.version);

export function useAppVersion() {
  return {
    version
  };
}
