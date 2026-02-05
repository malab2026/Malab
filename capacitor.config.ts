import type { CapacitorConfig } from '@capacitor/cli';
// Trigger Build: 2026-02-05 - v1.1.3
const config: CapacitorConfig = {
  appId: 'com.malaeb.booking',
  appName: 'MALA3EBNA',
  webDir: 'public',
  server: {
    url: 'https://malab-theta.vercel.app',
    cleartext: true
  }
};

export default config;
