export const OAuthConfig = {
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
    authUri: import.meta.env.VITE_GOOGLE_AUTH_URI,
  },
};
