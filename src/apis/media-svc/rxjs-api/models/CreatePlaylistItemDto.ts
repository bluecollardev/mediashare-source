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

import {
    MediaVisibilityType,
    TagKeyValue,
} from './index';

/**
 * @export
 * @interface CreatePlaylistItemDto
 */
export interface CreatePlaylistItemDto {
    /**
     * @type {string}
     * @memberof CreatePlaylistItemDto
     */
    playlistId: string;
    /**
     * @type {string}
     * @memberof CreatePlaylistItemDto
     */
    mediaId: string;
    /**
     * @type {string}
     * @memberof CreatePlaylistItemDto
     */
    userId: string;
    /**
     * @type {string}
     * @memberof CreatePlaylistItemDto
     */
    createdBy: string;
    /**
     * @type {string}
     * @memberof CreatePlaylistItemDto
     */
    title: string;
    /**
     * @type {string}
     * @memberof CreatePlaylistItemDto
     */
    summary?: string;
    /**
     * @type {string}
     * @memberof CreatePlaylistItemDto
     */
    description: string;
    /**
     * @type {string}
     * @memberof CreatePlaylistItemDto
     */
    uri: string;
    /**
     * @type {string}
     * @memberof CreatePlaylistItemDto
     */
    imageSrc?: string;
    /**
     * @type {number}
     * @memberof CreatePlaylistItemDto
     */
    sortIndex?: number;
    /**
     * @type {boolean}
     * @memberof CreatePlaylistItemDto
     */
    isPlayable?: boolean;
    /**
     * @type {MediaVisibilityType}
     * @memberof CreatePlaylistItemDto
     */
    visibility: MediaVisibilityType;
    /**
     * @type {Array<TagKeyValue>}
     * @memberof CreatePlaylistItemDto
     */
    tags?: Array<TagKeyValue> | null;
}
