import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.malaeb.booking',
  appName: 'Malaeb',
  webDir: 'public',
  server: {
    url: 'https://malab-theta.vercel.app',
    cleartext: true
  }
};

export default config;
