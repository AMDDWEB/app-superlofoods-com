import { isPlatform } from '@ionic/vue'

export const domain = import.meta.env.VITE_AUTH0_DOMAIN
export const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
const appId = import.meta.env.VITE_APP_ID

const auth0Domain = domain
const iosOrAndroid = isPlatform('hybrid')

export const callbackUri = iosOrAndroid
  ? `${appId}://${auth0Domain}/capacitor/${appId}/callback`
  : 'https://localhost:8100' 