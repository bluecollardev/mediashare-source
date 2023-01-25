import {
  Configuration,
  Middleware,
  RequestArgs,
  ResponseArgs,
  servers,
  DefaultApi,
  SearchApi,
  MediaItemsApi,
  PlaylistsApi,
  PlaylistItemsApi,
  ShareItemsApi,
  UserApi,
  UsersApi,
  TagsApi,
  ViewsApi,
} from 'mediashare/rxjs-api';
import Config from 'mediashare/config';

function apiFactory() {
  function middlewareFactory() {
    let TOKEN = '';
    let COOKIE = '';
    let ID_TOKEN = '';
    /* let TOKEN = undefined;
    let COOKIE = undefined;
    let ID_TOKEN = undefined; */
    const cookieMiddleware: Middleware = {
      /* post: (response: ResponseArgs) => {
        const { xhr, request } = response;
        try {
          let cookie;
          let token;
          let idToken
          if (xhr?.responseHeaders) {
            cookie = xhr?.responseHeaders?.['Set-Cookie'];
            token = xhr?.responseHeaders?.['Authorization'];
            idToken = xhr?.responseHeaders?.['Id'];
          } else if (request.body) {
            const parsed = JSON.parse(request.body);
            if (parsed?.accessToken) {
              TOKEN = parsed?.accessToken;
              ID_TOKEN = parsed?.idToken;
            }
          }
          
          COOKIE = cookie ? cookie : COOKIE;
          TOKEN = token ? token : TOKEN;
          ID_TOKEN = idToken ? idToken : ID_TOKEN;
          console.log(TOKEN);
        } catch (err) {
          console.log(`[cookieMiddleware.post] Middleware error`);
          console.log(err);
          throw err;
        }
        
        return response;
      },
      pre: (request: RequestArgs) => {
        const { headers: prevHeaders, ...rest } = request;
        const authHeaders = {};
  
        if (TOKEN) authHeaders['Authorization'] = `Bearer ${TOKEN}`;
        if (COOKIE) authHeaders['cookie'] = COOKIE.split(';')[0];
        if (ID_TOKEN) authHeaders['id'] = ID_TOKEN;
        
        const headers = { ...prevHeaders, ...authHeaders };
        return { headers, ...rest };
      }, */
      post: (response: ResponseArgs) => {
        try {
          const originalEvent = response.xhr;
          // TODO: In native app we can use originalEvent.responseHeaders and in web we have to use
          // const responseHeaders = originalEvent.responseHeaders || originalEvent;
          const cookie = originalEvent.responseHeaders['Set-Cookie'];
          const token = originalEvent.responseHeaders.Authorization;
          const idToken = originalEvent.responseHeaders.Id;
          COOKIE = cookie ? cookie : COOKIE;
          TOKEN = token ? token : TOKEN;
          ID_TOKEN = idToken ? idToken : ID_TOKEN;
          console.log(TOKEN);
        } catch (err) {
          console.log(err);
          throw err;
        }
    
        return response;
      },
      pre: (request: RequestArgs) => {
        const { headers: prevHeaders, ...rest } = request;
    
        const headers = {
          ...prevHeaders,
          Authorization: `Bearer ${TOKEN}`,
          cookie: COOKIE.split(';')[0],
          id: ID_TOKEN,
        };
        // console.log(headers);
        return { headers, ...rest };
      },
    };

    return [cookieMiddleware];
  }
  
  console.log(`Configuration: ${JSON.stringify(Config, null, 2)}`);
  const configuration = new Configuration({
    basePath: servers[Config.ApiServer].getUrl(),
    middleware: middlewareFactory(),
  });

  return {
    default: new DefaultApi(configuration),
    search: new SearchApi(configuration),
    mediaItems: new MediaItemsApi(configuration),
    playlists: new PlaylistsApi(configuration),
    playlistItems: new PlaylistItemsApi(configuration),
    shareItems: new ShareItemsApi(configuration),
    user: new UserApi(configuration),
    users: new UsersApi(configuration),
    views: new ViewsApi(configuration),
    tags: new TagsApi(configuration),
    configuration,
  };
}

const apis = apiFactory();
export type ApiService = typeof apis;

const { search, mediaItems, shareItems, playlists, playlistItems, user, users, views, tags, configuration } = apis;

export { apis, search, mediaItems, shareItems, playlists, playlistItems, user, users, views, tags, configuration };
