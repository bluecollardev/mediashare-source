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
import { BaseAPI, HttpHeaders, HttpQuery, throwIfNullOrUndefined, encodeURI, OperationOpts, RawAjaxResponse } from '../runtime';
import {
    CreateMediaItemDto,
    MediaItemDto,
    UpdateMediaItemDto,
} from '../models';

export interface MediaItemControllerCreateRequest {
    createMediaItemDto: CreateMediaItemDto;
}

export interface MediaItemControllerFindAllRequest {
    text?: string;
    tags?: Array<string>;
}

export interface MediaItemControllerFindOneRequest {
    mediaId: string;
}

export interface MediaItemControllerRemoveRequest {
    mediaId: string;
}

export interface MediaItemControllerShareRequest {
    mediaId: string;
    userId: string;
    userId2: string;
}

export interface MediaItemControllerUpdateRequest {
    mediaId: string;
    updateMediaItemDto: UpdateMediaItemDto;
}

/**
 * no description
 */
export class MediaItemsApi extends BaseAPI {

    /**
     */
    mediaItemControllerCreate({ createMediaItemDto }: MediaItemControllerCreateRequest): Observable<object>
    mediaItemControllerCreate({ createMediaItemDto }: MediaItemControllerCreateRequest, opts?: OperationOpts): Observable<RawAjaxResponse<object>>
    mediaItemControllerCreate({ createMediaItemDto }: MediaItemControllerCreateRequest, opts?: OperationOpts): Observable<object | RawAjaxResponse<object>> {
        throwIfNullOrUndefined(createMediaItemDto, 'createMediaItemDto', 'mediaItemControllerCreate');

        const headers: HttpHeaders = {
            'Content-Type': 'application/json',
            ...(this.configuration.username != null && this.configuration.password != null ? { Authorization: `Basic ${btoa(this.configuration.username + ':' + this.configuration.password)}` } : undefined),
        };

        return this.request<object>({
            url: '/api/media-items',
            method: 'POST',
            headers,
            body: createMediaItemDto,
        }, opts?.responseOpts);
    };

    /**
     */
    mediaItemControllerFindAll({ text, tags }: MediaItemControllerFindAllRequest): Observable<Array<MediaItemDto>>
    mediaItemControllerFindAll({ text, tags }: MediaItemControllerFindAllRequest, opts?: OperationOpts): Observable<RawAjaxResponse<Array<MediaItemDto>>>
    mediaItemControllerFindAll({ text, tags }: MediaItemControllerFindAllRequest, opts?: OperationOpts): Observable<Array<MediaItemDto> | RawAjaxResponse<Array<MediaItemDto>>> {

        const headers: HttpHeaders = {
            ...(this.configuration.username != null && this.configuration.password != null ? { Authorization: `Basic ${btoa(this.configuration.username + ':' + this.configuration.password)}` } : undefined),
        };

        const query: HttpQuery = {};

        if (text != null) { query['text'] = text; }
        if (tags != null) { query['tags'] = tags; }

        return this.request<Array<MediaItemDto>>({
            url: '/api/media-items',
            method: 'GET',
            headers,
            query,
        }, opts?.responseOpts);
    };

    /**
     */
    mediaItemControllerFindOne({ mediaId }: MediaItemControllerFindOneRequest): Observable<MediaItemDto>
    mediaItemControllerFindOne({ mediaId }: MediaItemControllerFindOneRequest, opts?: OperationOpts): Observable<RawAjaxResponse<MediaItemDto>>
    mediaItemControllerFindOne({ mediaId }: MediaItemControllerFindOneRequest, opts?: OperationOpts): Observable<MediaItemDto | RawAjaxResponse<MediaItemDto>> {
        throwIfNullOrUndefined(mediaId, 'mediaId', 'mediaItemControllerFindOne');

        const headers: HttpHeaders = {
            ...(this.configuration.username != null && this.configuration.password != null ? { Authorization: `Basic ${btoa(this.configuration.username + ':' + this.configuration.password)}` } : undefined),
        };

        return this.request<MediaItemDto>({
            url: '/api/media-items/{mediaId}'.replace('{mediaId}', encodeURI(mediaId)),
            method: 'GET',
            headers,
        }, opts?.responseOpts);
    };

    /**
     */
    mediaItemControllerFindPopular(): Observable<Array<MediaItemDto>>
    mediaItemControllerFindPopular(opts?: OperationOpts): Observable<RawAjaxResponse<Array<MediaItemDto>>>
    mediaItemControllerFindPopular(opts?: OperationOpts): Observable<Array<MediaItemDto> | RawAjaxResponse<Array<MediaItemDto>>> {
        const headers: HttpHeaders = {
            ...(this.configuration.username != null && this.configuration.password != null ? { Authorization: `Basic ${btoa(this.configuration.username + ':' + this.configuration.password)}` } : undefined),
        };

        return this.request<Array<MediaItemDto>>({
            url: '/api/media-items/popular',
            method: 'GET',
            headers,
        }, opts?.responseOpts);
    };

    /**
     */
    mediaItemControllerGetVisibilities(): Observable<void>
    mediaItemControllerGetVisibilities(opts?: OperationOpts): Observable<void | RawAjaxResponse<void>>
    mediaItemControllerGetVisibilities(opts?: OperationOpts): Observable<void | RawAjaxResponse<void>> {
        return this.request<void>({
            url: '/api/media-items/visibilities',
            method: 'GET',
        }, opts?.responseOpts);
    };

    /**
     */
    mediaItemControllerRemove({ mediaId }: MediaItemControllerRemoveRequest): Observable<void>
    mediaItemControllerRemove({ mediaId }: MediaItemControllerRemoveRequest, opts?: OperationOpts): Observable<void | RawAjaxResponse<void>>
    mediaItemControllerRemove({ mediaId }: MediaItemControllerRemoveRequest, opts?: OperationOpts): Observable<void | RawAjaxResponse<void>> {
        throwIfNullOrUndefined(mediaId, 'mediaId', 'mediaItemControllerRemove');

        const headers: HttpHeaders = {
            ...(this.configuration.username != null && this.configuration.password != null ? { Authorization: `Basic ${btoa(this.configuration.username + ':' + this.configuration.password)}` } : undefined),
        };

        return this.request<void>({
            url: '/api/media-items/{mediaId}'.replace('{mediaId}', encodeURI(mediaId)),
            method: 'DELETE',
            headers,
        }, opts?.responseOpts);
    };

    /**
     */
    mediaItemControllerShare({ mediaId, userId, userId2 }: MediaItemControllerShareRequest): Observable<object>
    mediaItemControllerShare({ mediaId, userId, userId2 }: MediaItemControllerShareRequest, opts?: OperationOpts): Observable<RawAjaxResponse<object>>
    mediaItemControllerShare({ mediaId, userId, userId2 }: MediaItemControllerShareRequest, opts?: OperationOpts): Observable<object | RawAjaxResponse<object>> {
        throwIfNullOrUndefined(mediaId, 'mediaId', 'mediaItemControllerShare');
        throwIfNullOrUndefined(userId, 'userId', 'mediaItemControllerShare');
        throwIfNullOrUndefined(userId2, 'userId2', 'mediaItemControllerShare');

        const headers: HttpHeaders = {
            ...(this.configuration.username != null && this.configuration.password != null ? { Authorization: `Basic ${btoa(this.configuration.username + ':' + this.configuration.password)}` } : undefined),
        };

        return this.request<object>({
            url: '/api/media-items/{mediaId}/share/{userId}'.replace('{mediaId}', encodeURI(mediaId)).replace('{userId}', encodeURI(userId)).replace('{:userId}', encodeURI(userId2)),
            method: 'POST',
            headers,
        }, opts?.responseOpts);
    };

    /**
     */
    mediaItemControllerUpdate({ mediaId, updateMediaItemDto }: MediaItemControllerUpdateRequest): Observable<object>
    mediaItemControllerUpdate({ mediaId, updateMediaItemDto }: MediaItemControllerUpdateRequest, opts?: OperationOpts): Observable<RawAjaxResponse<object>>
    mediaItemControllerUpdate({ mediaId, updateMediaItemDto }: MediaItemControllerUpdateRequest, opts?: OperationOpts): Observable<object | RawAjaxResponse<object>> {
        throwIfNullOrUndefined(mediaId, 'mediaId', 'mediaItemControllerUpdate');
        throwIfNullOrUndefined(updateMediaItemDto, 'updateMediaItemDto', 'mediaItemControllerUpdate');

        const headers: HttpHeaders = {
            'Content-Type': 'application/json',
            ...(this.configuration.username != null && this.configuration.password != null ? { Authorization: `Basic ${btoa(this.configuration.username + ':' + this.configuration.password)}` } : undefined),
        };

        return this.request<object>({
            url: '/api/media-items/{mediaId}'.replace('{mediaId}', encodeURI(mediaId)),
            method: 'PUT',
            headers,
            body: updateMediaItemDto,
        }, opts?.responseOpts);
    };

}
