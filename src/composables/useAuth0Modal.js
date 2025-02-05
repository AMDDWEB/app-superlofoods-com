import { useAuth0 } from '@auth0/auth0-vue'
import { callbackUri } from '../auth.config'
import { Browser } from '@capacitor/browser'
import { useRouter } from 'vue-router'
import { watch } from 'vue'
import { TokenStorage } from '../utils/tokenStorage'
import CustomerApi from '../axios/apiCustomer'

export const useAuthModule = () => {
  const router = useRouter()

  const {
    getAccessTokenSilently,
    handleRedirectCallback,
    isAuthenticated,
    loginWithRedirect,
    logout,
    user
  } = useAuth0()

  // Watch for authentication state changes
  watch(isAuthenticated, async (isAuth) => {
    if (isAuth) {
      try {
        if (!TokenStorage.getAccessToken()) {
          const accessToken = await getAccessTokenSilently()
          TokenStorage.setTokens(accessToken, '') // Store access token, no refresh token for Auth0
          
          // Check for existing user and store card number
          try {
            const response = await CustomerApi.checkForExistingUser(accessToken, localStorage.getItem('storeId'))
            if (import.meta.env.VITE_HAS_MIDAX_COUPONS === "true") {
              if (response.data && response.data.card_number) {
                localStorage.setItem('cardNumber', response.data.card_number)
              }
            } else {
              localStorage.removeItem('cardNumber')
            }
          } catch (error) {
            console.error('Error checking for existing user:', error)
          }
        }
      } catch (error) {
        console.error('Error getting access token:', error)
        // Only force browser login if token acquisition fails
        await signIn()
      }
    }
  }, { immediate: true })

  const signIn = async () => {
    await loginWithRedirect({
      openUrl: url => Browser.open({
        url,
        presentationStyle: 'popover',
        windowName: '_self'
      }),
      // Only force login prompt when explicitly signing in
      ...((!isAuthenticated.value || !TokenStorage.getAccessToken()) && {
        authorizationParams: {
          prompt: 'login'
        }
      })
    })
  }

  const signOut = async () => {
    // Clear all auth-related storage first, but preserve storeId
    TokenStorage.clearTokens();
    localStorage.removeItem('cardNumber');
    localStorage.removeItem('access_token');
    
    try {
      await logout({
        logoutParams: {
          returnTo: callbackUri,
          federated: true,
          localOnly: false
        },
        openUrl: async (url) => {
          // Clear any remaining Auth0 session cookies before opening browser
          document.cookie.split(";").forEach((c) => {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
          
          await Browser.open({
            url,
            presentationStyle: 'popover',
            windowName: '_self'
          });
        }
      });
      
      // Clear any remaining session data and reload
      sessionStorage.clear();
      localStorage.removeItem('auth0.is.authenticated');
      window.location.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.replace('/');
    }
  }

  return {
    handleRedirectCallback,
    isAuthenticated,
    getAccessTokenSilently,
    signIn,
    signOut,
    user
  }
}
