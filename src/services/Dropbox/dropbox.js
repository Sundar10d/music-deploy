import {
  UPLOAD,
  DOWNLOAD,
  RPC,
  APP_AUTH,
  TEAM_AUTH,
  USER_AUTH,
  NO_AUTH,
  COOKIE,
} from './constants.js';
import { baseApiUrl, httpHeaderSafeJson } from './utils.js';
import { parseDownloadResponse, parseResponse } from './response.js';
import DropboxAuth from "./auth"
const b64 = typeof btoa === 'undefined'
  ? (str) => Buffer.from(str).toString('base64')
  : btoa;

export default class Dropbox {
    constructor(options){
        this.options=options || {}
        if (options.auth) {
            this.auth = options.auth;
          } else {
            this.auth = new DropboxAuth(options);
          }
    }
    request(path, args, auth, host, style) {
      // scope is provided after "style", but unused in requests, so it's not in parameters
      switch (style) {
        case RPC:
          return this.rpcRequest(path, args, auth, host);
        case DOWNLOAD:
          return this.downloadRequest(path, args, auth, host);
        case UPLOAD:
          return this.uploadRequest(path, args, auth, host);
        default:
          throw new Error(`Invalid request style: ${style}`);
      }
    }

    rpcRequest(path, body, auth, host) {
      return this.auth.checkAndRefreshAccessToken()
        .then(() => {
          const fetchOptions = {
            method: 'POST',
            body: (body) ? JSON.stringify(body) : null,
            headers: {},
          };
  
          if (body) {
            fetchOptions.headers['Content-Type'] = 'application/json';
          }
  
          this.setAuthHeaders(auth, fetchOptions);
          this.setCommonHeaders(fetchOptions);
  
          return fetchOptions;
        })
        .then((fetchOptions) => fetch(
          baseApiUrl(host, this.domain, this.domainDelimiter) + path,
          fetchOptions,
        ))
        .then((res) => parseResponse(res));
    }
    
    uploadRequest(path, args, auth, host) {
      return this.auth.checkAndRefreshAccessToken()
        .then(() => {
          const { contents } = args;
          delete args.contents;
  
          const fetchOptions = {
            body: contents,
            method: 'POST',
            headers: {
              'Content-Type': 'application/octet-stream',
              'Dropbox-API-Arg': httpHeaderSafeJson(args),
            },
          };
  
          this.setAuthHeaders(auth, fetchOptions);
          this.setCommonHeaders(fetchOptions);
          console.log('fetchOptions',fetchOptions)
          return fetchOptions;
        })
        .then((fetchOptions) => fetch(
          baseApiUrl(host, this.domain, this.domainDelimiter) + path,
          fetchOptions,
        ))
        .then((res) => parseResponse(res));
    }

    setAuthHeaders(auth, fetchOptions) {
      // checks for multiauth and assigns auth based on priority to create header in switch case
      if (auth.split(',').length > 1) {
        const authTypes = auth.replace(' ', '').split(',');
        if (authTypes.includes(USER_AUTH) && this.auth.getAccessToken()) {
          auth = USER_AUTH;
        } else if (authTypes.includes(TEAM_AUTH) && this.auth.getAccessToken()) {
          auth = TEAM_AUTH;
        } else if (authTypes.includes(APP_AUTH)) {
          auth = APP_AUTH;
        }
      }
  
      switch (auth) {
        case APP_AUTH:
          if (this.auth.clientId && this.auth.clientSecret) {
            const authHeader = b64(`${this.auth.clientId}:${this.auth.clientSecret}`);
            fetchOptions.headers.Authorization = `Basic ${authHeader}`;
          }
          break;
        case TEAM_AUTH:
        case USER_AUTH:
          if (this.auth.getAccessToken()) {
            fetchOptions.headers.Authorization = `Bearer ${this.auth.getAccessToken()}`;
          }
          break;
        case NO_AUTH:
        case COOKIE:
          break;
        default:
          throw new Error(`Unhandled auth type: ${auth}`);
      }
    }
  
    setCommonHeaders(options) {
      if (this.selectUser) {
        options.headers['Dropbox-API-Select-User'] = this.selectUser;
      }
      if (this.selectAdmin) {
        options.headers['Dropbox-API-Select-Admin'] = this.selectAdmin;
      }
      if (this.pathRoot) {
        options.headers['Dropbox-API-Path-Root'] = this.pathRoot;
      }
      if (this.customHeaders) {
        const headerKeys = Object.keys(this.customHeaders);
        headerKeys.forEach((header) => {
          options.headers[header] = this.customHeaders[header];
        });
      }
    }
}