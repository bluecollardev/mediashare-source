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
} from './';

/**
 * @export
 * @interface UpdateMediaItemDto
 */
export interface UpdateMediaItemDto {
    /**
     * @type {string}
     * @memberof UpdateMediaItemDto
     */
    _id: string;
    /**
     * @type {string}
     * @memberof UpdateMediaItemDto
     */
    readonly createdAt?: string;
    /**
     * @type {string}
     * @memberof UpdateMediaItemDto
     */
    readonly updatedDate?: string;
    /**
     * @type {string}
     * @memberof UpdateMediaItemDto
     */
    title: string;
    /**
     * @type {string}
     * @memberof UpdateMediaItemDto
     */
    summary?: string;
    /**
     * @type {string}
     * @memberof UpdateMediaItemDto
     */
    description: string;
    /**
     * @type {string}
     * @memberof UpdateMediaItemDto
     */
    imageSrc?: string;
    /**
     * @type {MediaVisibilityType}
     * @memberof UpdateMediaItemDto
     */
    visibility: MediaVisibilityType;
    /**
     * @type {Array<TagKeyValue>}
     * @memberof UpdateMediaItemDto
     */
    tags?: Array<TagKeyValue> | null;
    /**
     * @type {string}
     * @memberof UpdateMediaItemDto
     */
    eTag?: string;
}
