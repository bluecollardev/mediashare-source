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
    TagKeyValue,
} from './index';

/**
 * @export
 * @interface MediaItemDto
 */
export interface MediaItemDto {
    /**
     * @type {string}
     * @memberof MediaItemDto
     */
    _id: string;
    /**
     * @type {string}
     * @memberof MediaItemDto
     */
    readonly createdAt?: string;
    /**
     * @type {string}
     * @memberof MediaItemDto
     */
    readonly updatedDate?: string;
    /**
     * @type {string}
     * @memberof MediaItemDto
     */
    key: string;
    /**
     * @type {string}
     * @memberof MediaItemDto
     */
    userId: string;
    /**
     * @type {string}
     * @memberof MediaItemDto
     */
    title: string;
    /**
     * @type {string}
     * @memberof MediaItemDto
     */
    summary?: string;
    /**
     * @type {string}
     * @memberof MediaItemDto
     */
    description: string;
    /**
     * @type {string}
     * @memberof MediaItemDto
     */
    uri: string;
    /**
     * @type {string}
     * @memberof MediaItemDto
     */
    imageSrc?: string;
    /**
     * @type {boolean}
     * @memberof MediaItemDto
     */
    isPlayable?: boolean;
    /**
     * @type {string}
     * @memberof MediaItemDto
     */
    visibility: MediaItemDtoVisibilityEnum;
    /**
     * @type {Array<TagKeyValue>}
     * @memberof MediaItemDto
     */
    tags?: Array<TagKeyValue> | null;
    /**
     * @type {string}
     * @memberof MediaItemDto
     */
    eTag?: string;
    /**
     * @type {number}
     * @memberof MediaItemDto
     */
    shareCount: number;
    /**
     * @type {number}
     * @memberof MediaItemDto
     */
    viewCount: number;
    /**
     * @type {number}
     * @memberof MediaItemDto
     */
    likesCount: number;
}

/**
 * @export
 * @enum {string}
 */
export enum MediaItemDtoVisibilityEnum {
    Private = 'private',
    Shared = 'shared',
    Subscription = 'subscription',
    Public = 'public'
}

