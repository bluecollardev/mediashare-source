import {
  Configuration as MediaApiConfig,
  Middleware,
  RequestArgs,
  ResponseArgs,
  servers,
  DefaultApi,
  SearchApi,
  MediaItemsApi,
  PlaylistsApi,
  PlaylistItemsApi,
  // ShareItemsApi,
  // ViewsApi,
} from 'mediashare/apis/media-svc/rxjs-api';
import {
  Configuration as UserApiConfig,
  UserApi,
} from 'mediashare/apis/user-svc/rxjs-api';
import {
  Configuration as TagsApiConfig,
  TagsApi,
} from 'mediashare/apis/tags-svc/rxjs-api';
import Config from 'mediashare/config';

function apiFactory() {
  function middlewareFactory() {
    let TOKEN = '';
    let COOKIE = '';
    let ID_TOKEN = '';
    const cookieMiddleware: Middleware = {
      post: (response: ResponseArgs & any) => {
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
          // console.log(TOKEN);
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
      },
    };

    return [cookieMiddleware];
  }
  
  console.log(`Configuration: ${JSON.stringify(Config, null, 2)}`);
  const mediaApiConfiguration = new MediaApiConfig({
    basePath: servers[Config.ApiServer].getUrl(),
    middleware: middlewareFactory(),
  });
  
  const userApiConfiguration = new UserApiConfig({
    basePath: servers[Config.ApiServer].getUrl(),
    middleware: middlewareFactory(),
  });
  
  const tagsApiConfiguration = new TagsApiConfig({
    basePath: servers[Config.ApiServer].getUrl(),
    middleware: middlewareFactory(),
  });

  return {
    default: new DefaultApi(mediaApiConfiguration),
    search: new SearchApi(mediaApiConfiguration),
    mediaItems: new MediaItemsApi(mediaApiConfiguration),
    playlists: new PlaylistsApi(mediaApiConfiguration),
    playlistItems: new PlaylistItemsApi(mediaApiConfiguration),
    // shareItems: new ShareItemsApi(mediaApiConfiguration),
    user: new UserApi(userApiConfiguration),
    // views: new ViewsApi(configuration),
    tags: new TagsApi(tagsApiConfiguration),
    configuration: mediaApiConfiguration,
    mediaApiConfiguration,
    userApiConfiguration,
  };
}

const apis = apiFactory();
export type ApiService = typeof apis;

const { search, mediaItems, shareItems, playlists, playlistItems, user, views, tags, configuration, mediaApiConfiguration, userApiConfiguration } = apis;

export { apis, search, mediaItems, shareItems, playlists, playlistItems, user, views, tags, configuration, mediaApiConfiguration, userApiConfiguration };
