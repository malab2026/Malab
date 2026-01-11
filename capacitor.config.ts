import type { CapacitorConfig } from '@capacitor/cli';

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
