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
    MediaItemDto,
    PlaylistItemDto,
    PlaylistVisibilityType,
} from './';

/**
 * @export
 * @interface PlaylistDto
 */
export interface PlaylistDto {
    /**
     * @type {string}
     * @memberof PlaylistDto
     */
    _id: string;
    /**
     * @type {string}
     * @memberof PlaylistDto
     */
    readonly createdAt?: string;
    /**
     * @type {string}
     * @memberof PlaylistDto
     */
    readonly updatedDate?: string;
    /**
     * @type {string}
     * @memberof PlaylistDto
     */
    cloneOf?: string;
    /**
     * @type {string}
     * @memberof PlaylistDto
     */
    title: string;
    /**
     * @type {string}
     * @memberof PlaylistDto
     */
    description: string;
    /**
     * @type {string}
     * @memberof PlaylistDto
     */
    imageSrc: string;
    /**
     * @type {PlaylistVisibilityType}
     * @memberof PlaylistDto
     */
    visibility: PlaylistVisibilityType;
    /**
     * @type {Array<MediaItemDto>}
     * @memberof PlaylistDto
     */
    mediaItems: Array<MediaItemDto>;
    /**
     * @type {Array<PlaylistItemDto>}
     * @memberof PlaylistDto
     */
    playlistItems: Array<PlaylistItemDto>;
    /**
     * @type {number}
     * @memberof PlaylistDto
     */
    shareCount: number;
    /**
     * @type {number}
     * @memberof PlaylistDto
     */
    viewCount: number;
    /**
     * @type {number}
     * @memberof PlaylistDto
     */
    likesCount: number;
}
