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
    MediaShareItemDto,
    PlaylistShareItemDto,
} from './index';

/**
 * @export
 * @interface ShareItemsDto
 */
export interface ShareItemsDto {
    /**
     * @type {MediaShareItemDto}
     * @memberof ShareItemsDto
     */
    mediaItems: MediaShareItemDto;
    /**
     * @type {PlaylistShareItemDto}
     * @memberof ShareItemsDto
     */
    playlists: PlaylistShareItemDto;
}
