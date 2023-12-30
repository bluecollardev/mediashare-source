// tslint:disable
/**
 * Media Service
 * Media Service
 *
 * The version of the OpenAPI document: 0.0.1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { Observable } from 'rxjs';
import { BaseAPI, HttpHeaders, throwIfNullOrUndefined, encodeURI, OperationOpts, RawAjaxResponse } from '../runtime';
import {
    MediaItemDto,
    MediaShareItemDto,
    PlaylistDto,
    PlaylistShareItemDto,
    ShareItemsByUserIdDto,
    ShareItemsDto,
} from '../models';

export interface ShareItemControllerFindShareItemRequest {
    shareId: string;
}

export interface ShareItemControllerReadShareItemRequest {
    shareId: string;
}

export interface ShareItemControllerRemoveAllShareItemsRequest {
    shareItemsDto: ShareItemsDto;
}

export interface ShareItemControllerRemoveShareItemRequest {
    shareId: string;
}

export interface ShareItemControllerRemoveShareItemAllByUserIdRequest {
    shareItemsByUserIdDto: ShareItemsByUserIdDto;
}

export interface ShareItemControllerShareMediaItemRequest {
    mediaId: string;
    userSub: string;
}

export interface ShareItemControllerSharePlaylistRequest {
    playlistId: string;
    userSub: string;
}

/**
 * no description
 */
export class ShareItemsApi extends BaseAPI {

    /**
     */
    shareItemControllerFindItemsSharedByUser(): Observable<Array<ShareItemsDto>>
    shareItemControllerFindItemsSharedByUser(opts?: OperationOpts): Observable<RawAjaxResponse<Array<ShareItemsDto>>>
    shareItemControllerFindItemsSharedByUser(opts?: OperationOpts): Observable<Array<ShareItemsDto> | RawAjaxResponse<Array<ShareItemsDto>>> {
        const headers: HttpHeaders = {
            ...(this.configuration.username != null && this.configuration.password != null ? { Authorization: `Basic ${btoa(this.configuration.username + ':' + this.configuration.password)}` } : undefined),
        };

        return this.request<Array<ShareItemsDto>>({
            url: '/api/share-items/shared-by-user',
            method: 'GET',
            headers,
        }, opts?.responseOpts);
    };

    /**
     */
    shareItemControllerFindItemsSharedWithUser(): Observable<ShareItemsDto>
    shareItemControllerFindItemsSharedWithUser(opts?: OperationOpts): Observable<RawAjaxResponse<ShareItemsDto>>
    shareItemControllerFindItemsSharedWithUser(opts?: OperationOpts): Observable<ShareItemsDto | RawAjaxResponse<ShareItemsDto>> {
        const headers: HttpHeaders = {
            ...(this.configuration.username != null && this.configuration.password != null ? { Authorization: `Basic ${btoa(this.configuration.username + ':' + this.configuration.password)}` } : undefined),
        };

        return this.request<ShareItemsDto>({
            url: '/api/share-items/shared-with-user',
            method: 'GET',
            headers,
        }, opts?.responseOpts);
    };

    /**
     */
    shareItemControllerFindMediaItemsSharedByUser(): Observable<Array<MediaItemDto>>
    shareItemControllerFindMediaItemsSharedByUser(opts?: OperationOpts): Observable<RawAjaxResponse<Array<MediaItemDto>>>
    shareItemControllerFindMediaItemsSharedByUser(opts?: OperationOpts): Observable<Array<MediaItemDto> | RawAjaxResponse<Array<MediaItemDto>>> {
        const headers: HttpHeaders = {
            ...(this.configuration.username != null && this.configuration.password != null ? { Authorization: `Basic ${btoa(this.configuration.username + ':' + this.configuration.password)}` } : undefined),
        };

        return this.request<Array<MediaItemDto>>({
            url: '/api/share-items/shared-by-user/media-items',
            method: 'GET',
            headers,
        }, opts?.responseOpts);
    };

    /**
     */
    shareItemControllerFindMediaItemsSharedWithUser(): Observable<Array<MediaItemDto>>
    shareItemControllerFindMediaItemsSharedWithUser(opts?: OperationOpts): Observable<RawAjaxResponse<Array<MediaItemDto>>>
    shareItemControllerFindMediaItemsSharedWithUser(opts?: OperationOpts): Observable<Array<MediaItemDto> | RawAjaxResponse<Array<MediaItemDto>>> {
        const headers: HttpHeaders = {
            ...(this.configuration.username != null && this.configuration.password != null ? { Authorization: `Basic ${btoa(this.configuration.username + ':' + this.configuration.password)}` } : undefined),
        };

        return this.request<Array<MediaItemDto>>({
            url: '/api/share-items/shared-with-user/media-items',
            method: 'GET',
            headers,
        }, opts?.responseOpts);
    };

    /**
     */
    shareItemControllerFindPlaylistsSharedByUser(): Observable<Array<PlaylistDto>>
    shareItemControllerFindPlaylistsSharedByUser(opts?: OperationOpts): Observable<RawAjaxResponse<Array<PlaylistDto>>>
    shareItemControllerFindPlaylistsSharedByUser(opts?: OperationOpts): Observable<Array<PlaylistDto> | RawAjaxResponse<Array<PlaylistDto>>> {
        const headers: HttpHeaders = {
            ...(this.configuration.username != null && this.configuration.password != null ? { Authorization: `Basic ${btoa(this.configuration.username + ':' + this.configuration.password)}` } : undefined),
        };

        return this.request<Array<PlaylistDto>>({
            url: '/api/share-items/shared-by-user/playlists',
            method: 'GET',
            headers,
        }, opts?.responseOpts);
    };

    /**
     */
    shareItemControllerFindPlaylistsSharedWithUser(): Observable<Array<PlaylistDto>>
    shareItemControllerFindPlaylistsSharedWithUser(opts?: OperationOpts): Observable<RawAjaxResponse<Array<PlaylistDto>>>
    shareItemControllerFindPlaylistsSharedWithUser(opts?: OperationOpts): Observable<Array<PlaylistDto> | RawAjaxResponse<Array<PlaylistDto>>> {
        const headers: HttpHeaders = {
            ...(this.configuration.username != null && this.configuration.password != null ? { Authorization: `Basic ${btoa(this.configuration.username + ':' + this.configuration.password)}` } : undefined),
        };

        return this.request<Array<PlaylistDto>>({
            url: '/api/share-items/shared-with-user/playlists',
            method: 'GET',
            headers,
        }, opts?.responseOpts);
    };

    /**
     */
    shareItemControllerFindShareItem({ shareId }: ShareItemControllerFindShareItemRequest): Observable<object>
    shareItemControllerFindShareItem({ shareId }: ShareItemControllerFindShareItemRequest, opts?: OperationOpts): Observable<RawAjaxResponse<object>>
    shareItemControllerFindShareItem({ shareId }: ShareItemControllerFindShareItemRequest, opts?: OperationOpts): Observable<object | RawAjaxResponse<object>> {
        throwIfNullOrUndefined(shareId, 'shareId', 'shareItemControllerFindShareItem');

        const headers: HttpHeaders = {
            ...(this.configuration.username != null && this.configuration.password != null ? { Authorization: `Basic ${btoa(this.configuration.username + ':' + this.configuration.password)}` } : undefined),
        };

        return this.request<object>({
            url: '/api/share-items/{shareId}'.replace('{shareId}', encodeURI(shareId)),
            method: 'GET',
            headers,
        }, opts?.responseOpts);
    };

    /**
     */
    shareItemControllerReadShareItem({ shareId }: ShareItemControllerReadShareItemRequest): Observable<object>
    shareItemControllerReadShareItem({ shareId }: ShareItemControllerReadShareItemRequest, opts?: OperationOpts): Observable<RawAjaxResponse<object>>
    shareItemControllerReadShareItem({ shareId }: ShareItemControllerReadShareItemRequest, opts?: OperationOpts): Observable<object | RawAjaxResponse<object>> {
        throwIfNullOrUndefined(shareId, 'shareId', 'shareItemControllerReadShareItem');

        const headers: HttpHeaders = {
            ...(this.configuration.username != null && this.configuration.password != null ? { Authorization: `Basic ${btoa(this.configuration.username + ':' + this.configuration.password)}` } : undefined),
        };

        return this.request<object>({
            url: '/api/share-items/read/{shareId}'.replace('{shareId}', encodeURI(shareId)),
            method: 'POST',
            headers,
        }, opts?.responseOpts);
    };

    /**
     */
    shareItemControllerRemoveAllShareItems({ shareItemsDto }: ShareItemControllerRemoveAllShareItemsRequest): Observable<void>
    shareItemControllerRemoveAllShareItems({ shareItemsDto }: ShareItemControllerRemoveAllShareItemsRequest, opts?: OperationOpts): Observable<void | RawAjaxResponse<void>>
    shareItemControllerRemoveAllShareItems({ shareItemsDto }: ShareItemControllerRemoveAllShareItemsRequest, opts?: OperationOpts): Observable<void | RawAjaxResponse<void>> {
        throwIfNullOrUndefined(shareItemsDto, 'shareItemsDto', 'shareItemControllerRemoveAllShareItems');

        const headers: HttpHeaders = {
            'Content-Type': 'application/json',
            ...(this.configuration.username != null && this.configuration.password != null ? { Authorization: `Basic ${btoa(this.configuration.username + ':' + this.configuration.password)}` } : undefined),
        };

        return this.request<void>({
            url: '/api/share-items/unshare-all-items',
            method: 'POST',
            headers,
            body: shareItemsDto,
        }, opts?.responseOpts);
    };

    /**
     */
    shareItemControllerRemoveShareItem({ shareId }: ShareItemControllerRemoveShareItemRequest): Observable<object>
    shareItemControllerRemoveShareItem({ shareId }: ShareItemControllerRemoveShareItemRequest, opts?: OperationOpts): Observable<RawAjaxResponse<object>>
    shareItemControllerRemoveShareItem({ shareId }: ShareItemControllerRemoveShareItemRequest, opts?: OperationOpts): Observable<object | RawAjaxResponse<object>> {
        throwIfNullOrUndefined(shareId, 'shareId', 'shareItemControllerRemoveShareItem');

        const headers: HttpHeaders = {
            ...(this.configuration.username != null && this.configuration.password != null ? { Authorization: `Basic ${btoa(this.configuration.username + ':' + this.configuration.password)}` } : undefined),
        };

        return this.request<object>({
            url: '/api/share-items/{shareId}'.replace('{shareId}', encodeURI(shareId)),
            method: 'DELETE',
            headers,
        }, opts?.responseOpts);
    };

    /**
     */
    shareItemControllerRemoveShareItemAllByUserId({ shareItemsByUserIdDto }: ShareItemControllerRemoveShareItemAllByUserIdRequest): Observable<void>
    shareItemControllerRemoveShareItemAllByUserId({ shareItemsByUserIdDto }: ShareItemControllerRemoveShareItemAllByUserIdRequest, opts?: OperationOpts): Observable<void | RawAjaxResponse<void>>
    shareItemControllerRemoveShareItemAllByUserId({ shareItemsByUserIdDto }: ShareItemControllerRemoveShareItemAllByUserIdRequest, opts?: OperationOpts): Observable<void | RawAjaxResponse<void>> {
        throwIfNullOrUndefined(shareItemsByUserIdDto, 'shareItemsByUserIdDto', 'shareItemControllerRemoveShareItemAllByUserId');

        const headers: HttpHeaders = {
            'Content-Type': 'application/json',
            ...(this.configuration.username != null && this.configuration.password != null ? { Authorization: `Basic ${btoa(this.configuration.username + ':' + this.configuration.password)}` } : undefined),
        };

        return this.request<void>({
            url: '/api/share-items/unshare-all-by-user-id',
            method: 'POST',
            headers,
            body: shareItemsByUserIdDto,
        }, opts?.responseOpts);
    };

    /**
     */
    shareItemControllerShareMediaItem({ mediaId, userSub }: ShareItemControllerShareMediaItemRequest): Observable<Array<MediaShareItemDto>>
    shareItemControllerShareMediaItem({ mediaId, userSub }: ShareItemControllerShareMediaItemRequest, opts?: OperationOpts): Observable<RawAjaxResponse<Array<MediaShareItemDto>>>
    shareItemControllerShareMediaItem({ mediaId, userSub }: ShareItemControllerShareMediaItemRequest, opts?: OperationOpts): Observable<Array<MediaShareItemDto> | RawAjaxResponse<Array<MediaShareItemDto>>> {
        throwIfNullOrUndefined(mediaId, 'mediaId', 'shareItemControllerShareMediaItem');
        throwIfNullOrUndefined(userSub, 'userSub', 'shareItemControllerShareMediaItem');

        const headers: HttpHeaders = {
            ...(this.configuration.username != null && this.configuration.password != null ? { Authorization: `Basic ${btoa(this.configuration.username + ':' + this.configuration.password)}` } : undefined),
        };

        return this.request<Array<MediaShareItemDto>>({
            url: '/api/share-items/user/{userSub}/media-item/{mediaId}'.replace('{mediaId}', encodeURI(mediaId)).replace('{userSub}', encodeURI(userSub)),
            method: 'POST',
            headers,
        }, opts?.responseOpts);
    };

    /**
     */
    shareItemControllerSharePlaylist({ playlistId, userSub }: ShareItemControllerSharePlaylistRequest): Observable<Array<PlaylistShareItemDto>>
    shareItemControllerSharePlaylist({ playlistId, userSub }: ShareItemControllerSharePlaylistRequest, opts?: OperationOpts): Observable<RawAjaxResponse<Array<PlaylistShareItemDto>>>
    shareItemControllerSharePlaylist({ playlistId, userSub }: ShareItemControllerSharePlaylistRequest, opts?: OperationOpts): Observable<Array<PlaylistShareItemDto> | RawAjaxResponse<Array<PlaylistShareItemDto>>> {
        throwIfNullOrUndefined(playlistId, 'playlistId', 'shareItemControllerSharePlaylist');
        throwIfNullOrUndefined(userSub, 'userSub', 'shareItemControllerSharePlaylist');

        const headers: HttpHeaders = {
            ...(this.configuration.username != null && this.configuration.password != null ? { Authorization: `Basic ${btoa(this.configuration.username + ':' + this.configuration.password)}` } : undefined),
        };

        return this.request<Array<PlaylistShareItemDto>>({
            url: '/api/share-items/user/{userSub}/playlist/{playlistId}'.replace('{playlistId}', encodeURI(playlistId)).replace('{userSub}', encodeURI(userSub)),
            method: 'POST',
            headers,
        }, opts?.responseOpts);
    };

}
