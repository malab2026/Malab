import type { CapacitorConfig } from '@capacitor/cli';
// Trigger Build: 2026-01-29 - v1.0.2

const config: CapacitorConfig = {
  appId: 'com.mala3ebna.booking',
  appName: 'MALA3EBNA',
  webDir: 'public',
  server: {
    url: 'https://malab-theta.vercel.app',
    cleartext: true
  }
};

export default config;
