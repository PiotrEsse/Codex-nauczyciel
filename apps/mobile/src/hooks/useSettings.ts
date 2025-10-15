import { useEffect, useState } from 'react';

import { useSettingsStore } from '@state/settingsStore';

export const useSettings = () => {
  const [ready, setReady] = useState(false);
  const settings = useSettingsStore();
  const loadSecureConfig = useSettingsStore((state) => state.loadSecureConfig);

  useEffect(() => {
    (async () => {
      await loadSecureConfig();
      setReady(true);
    })();
  }, [loadSecureConfig]);

  return { settings, ready };
};
