import {
  servers as mediaApiServers,
  Configuration as MediaApiConfig,
  Middleware,
  RequestArgs,
  ResponseArgs,
  DefaultApi,
  SearchApi,
  MediaItemsApi,
  PlaylistsApi,
  PlaylistItemsApi,
  ShareItemsApi,
  // ViewsApi,
} from 'mediashare/apis/media-svc/rxjs-api';
import {
  servers as userApiServers,
  Configuration as UserApiConfig,
  UserApi,
  EmailApi,
} from 'mediashare/apis/user-svc/rxjs-api'
import {
  servers as tagsApiServers,
  Configuration as TagsApiConfig,
  TagsApi,
} from 'mediashare/apis/tags-svc/rxjs-api';
import Config from 'mediashare/config';
import { AppDispatch, RootState } from 'mediashare/store/index'
import { getTokens } from 'mediashare/store/modules/auth'

export const cookieMiddleware = ({
  TOKEN = '',
  COOKIE = '',
  ID_TOKEN = '',
}): Middleware => ({
  post: (response: ResponseArgs & any) => {
    const { xhr, request } = response;
    try {
      let cookie: string;
      let token: string;
      let idToken: string;
      
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
  }
});

export const authMiddleware = ({ state }): Middleware => ({
  pre: (request: RequestArgs) => {
    const { headers: prevHeaders, ...rest } = request;
    const authHeaders = {};
    authHeaders['Authorization'] = `Bearer ${state.auth.idToken}`;
    const headers = { ...prevHeaders, ...authHeaders };
    // console.log(`headers: ${JSON.stringify(headers, null, 2)}`)
    return { headers, ...rest };
  }
});

export function apiFactory(thunkApi: { state: any; }) {
  function middlewareFactory() {
    // const cookie = cookieMiddleware({})
    const auth = authMiddleware(thunkApi)
    return [
      // cookie,
      auth,
    ];
  }
  
  // console.log(`Configuration: ${JSON.stringify(Config, null, 2)}`);
  const mediaApiConfiguration = new MediaApiConfig({
    basePath: mediaApiServers[Config.ApiServer].getUrl(),
    middleware: middlewareFactory(),
  });
  
  const userApiConfiguration = new UserApiConfig({
    basePath: userApiServers[Config.ApiServer].getUrl(),
    middleware: middlewareFactory(),
  });
  
  const tagsApiConfiguration = new TagsApiConfig({
    basePath: tagsApiServers[Config.ApiServer].getUrl(),
    middleware: middlewareFactory(),
  });

  return {
    default: new DefaultApi(mediaApiConfiguration),
    search: new SearchApi(mediaApiConfiguration),
    mediaItems: new MediaItemsApi(mediaApiConfiguration),
    playlists: new PlaylistsApi(mediaApiConfiguration),
    playlistItems: new PlaylistItemsApi(mediaApiConfiguration),
    shareItems: new ShareItemsApi(mediaApiConfiguration),
    user: new UserApi(userApiConfiguration),
    email: new EmailApi(userApiConfiguration),
    views: undefined, // new ViewsApi(configuration),
    tags: new TagsApi(tagsApiConfiguration),
    configuration: mediaApiConfiguration,
    mediaApiConfiguration,
    userApiConfiguration,
  } as ApiService;
}

export type ApiService = {
  default: DefaultApi;
  search: SearchApi;
  mediaItems: MediaItemsApi;
  playlists: PlaylistsApi;
  playlistItems: PlaylistItemsApi;
  shareItems: ShareItemsApi;
  user: UserApi;
  views: undefined; //ViewsApi(configuration);
  tags: TagsApi;
};
