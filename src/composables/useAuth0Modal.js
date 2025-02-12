import { useAuth0 } from '@auth0/auth0-vue'
import { Browser } from '@capacitor/browser'
import { useRouter } from 'vue-router'

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

  const signIn = async () => {
    await loginWithRedirect({
      openUrl: url =>
        Browser.open({
          url,
          presentationStyle: 'popover',
          windowName: '_self'
        })
    })
  }

  const signOut = async () => {
    await logout({
      logoutParams: {
        returnTo: callbackUri
      },
      openUrl: url =>
        Browser.open({
          url,
          windowName: '_self'
        })
    })
    router.go(-1)
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
