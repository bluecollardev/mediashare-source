// tslint:disable
/**
 * Mediashare
 * Mediashare API
 *
 * The version of the OpenAPI document: 0.1.5
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
    readonly _id?: string;
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
    createdBy?: string;
    /**
     * @type {string}
     * @memberof UpdateMediaItemDto
     */
    userId?: string;
    /**
     * @type {string}
     * @memberof UpdateMediaItemDto
     */
    title?: string;
    /**
     * @type {string}
     * @memberof UpdateMediaItemDto
     */
    summary?: string;
    /**
     * @type {string}
     * @memberof UpdateMediaItemDto
     */
    description?: string;
    /**
     * @type {string}
     * @memberof UpdateMediaItemDto
     */
    uri?: string;
    /**
     * @type {string}
     * @memberof UpdateMediaItemDto
     */
    imageSrc?: string;
    /**
     * @type {boolean}
     * @memberof UpdateMediaItemDto
     */
    isPlayable?: boolean;
    /**
     * @type {MediaVisibilityType}
     * @memberof UpdateMediaItemDto
     */
    visibility?: MediaVisibilityType;
    /**
     * @type {Array<TagKeyValue>}
     * @memberof UpdateMediaItemDto
     */
    tags?: Array<TagKeyValue> | null;
}
