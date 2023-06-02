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
    AuthorProfileDto,
    MediaVisibilityType,
    TagKeyValue,
} from './';

/**
 * @export
 * @interface MediaItemResponseDto
 */
export interface MediaItemResponseDto {
    /**
     * @type {string}
     * @memberof MediaItemResponseDto
     */
    readonly _id: string;
    /**
     * @type {string}
     * @memberof MediaItemResponseDto
     */
    readonly createdAt: string;
    /**
     * @type {string}
     * @memberof MediaItemResponseDto
     */
    readonly updatedDate?: string;
    /**
     * @type {string}
     * @memberof MediaItemResponseDto
     */
    createdBy: string;
    /**
     * @type {string}
     * @memberof MediaItemResponseDto
     */
    userId: string;
    /**
     * @type {string}
     * @memberof MediaItemResponseDto
     */
    title: string;
    /**
     * @type {string}
     * @memberof MediaItemResponseDto
     */
    summary: string;
    /**
     * @type {string}
     * @memberof MediaItemResponseDto
     */
    description: string;
    /**
     * @type {string}
     * @memberof MediaItemResponseDto
     */
    uri: string;
    /**
     * @type {string}
     * @memberof MediaItemResponseDto
     */
    imageSrc: string;
    /**
     * @type {boolean}
     * @memberof MediaItemResponseDto
     */
    isPlayable?: boolean;
    /**
     * @type {MediaVisibilityType}
     * @memberof MediaItemResponseDto
     */
    visibility?: MediaVisibilityType;
    /**
     * @type {Array<TagKeyValue>}
     * @memberof MediaItemResponseDto
     */
    tags: Array<TagKeyValue> | null;
    /**
     * @type {AuthorProfileDto}
     * @memberof MediaItemResponseDto
     */
    authorProfile: AuthorProfileDto;
    /**
     * @type {number}
     * @memberof MediaItemResponseDto
     */
    shareCount: number;
    /**
     * @type {number}
     * @memberof MediaItemResponseDto
     */
    viewCount: number;
    /**
     * @type {number}
     * @memberof MediaItemResponseDto
     */
    likesCount: number;
}