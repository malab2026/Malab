import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.malaeb.booking',
  appName: 'Malaeb',
  webDir: 'out',
  server: {
    // Replace with your Vercel URL once deployed
    // url: 'https://your-app.vercel.app',
    cleartext: false
  }
};

export default config;
