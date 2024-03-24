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
 * @interface UpdatePlaylistItemDto
 */
export interface UpdatePlaylistItemDto {
    /**
     * @type {string}
     * @memberof UpdatePlaylistItemDto
     */
    _id: string;
    /**
     * @type {string}
     * @memberof UpdatePlaylistItemDto
     */
    readonly createdAt?: string;
    /**
     * @type {string}
     * @memberof UpdatePlaylistItemDto
     */
    readonly updatedDate?: string;
    /**
     * @type {string}
     * @memberof UpdatePlaylistItemDto
     */
    playlistId: string;
    /**
     * @type {string}
     * @memberof UpdatePlaylistItemDto
     */
    mediaId: string;
    /**
     * @type {string}
     * @memberof UpdatePlaylistItemDto
     */
    userId: string;
    /**
     * @type {string}
     * @memberof UpdatePlaylistItemDto
     */
    createdBy: string;
    /**
     * @type {string}
     * @memberof UpdatePlaylistItemDto
     */
    title: string;
    /**
     * @type {string}
     * @memberof UpdatePlaylistItemDto
     */
    summary?: string;
    /**
     * @type {string}
     * @memberof UpdatePlaylistItemDto
     */
    description: string;
    /**
     * @type {string}
     * @memberof UpdatePlaylistItemDto
     */
    uri: string;
    /**
     * @type {string}
     * @memberof UpdatePlaylistItemDto
     */
    imageSrc?: string;
    /**
     * @type {number}
     * @memberof UpdatePlaylistItemDto
     */
    sortIndex?: number;
    /**
     * @type {boolean}
     * @memberof UpdatePlaylistItemDto
     */
    isPlayable?: boolean;
    /**
     * @type {MediaVisibilityType}
     * @memberof UpdatePlaylistItemDto
     */
    visibility?: MediaVisibilityType;
    /**
     * @type {Array<TagKeyValue>}
     * @memberof UpdatePlaylistItemDto
     */
    tags?: Array<TagKeyValue> | null;
}
