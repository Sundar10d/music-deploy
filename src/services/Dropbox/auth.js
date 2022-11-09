import {
    getTokenExpiresAtDate,
    isBrowserEnv,
    createBrowserSafeString,
    OAuth2AuthorizationUrl,
    OAuth2TokenUrl,
    isWorkerEnv,
  } from './utils.js';

export default class DropboxAuth{
    constructor(options){
        options = options || {};
        this.accessToken = options.accessToken
    }

    getAccessToken() {
        return this.accessToken;
      }
      getRefreshToken() {
        return this.refreshToken;
      }
      checkAndRefreshAccessToken() {
        // const canRefresh = this.getRefreshToken() && this.getClientId();
        // const needsRefresh = !this.getAccessTokenExpiresAt()
        //         || (new Date(Date.now() + TokenExpirationBuffer)) >= this.getAccessTokenExpiresAt();
        // const needsToken = !this.getAccessToken();
        // if ((needsRefresh || needsToken) && canRefresh) {
        //   return this.refreshAccessToken();
        // }
        return Promise.resolve();
      }
    
}