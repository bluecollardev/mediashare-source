// tslint:disable
/**
 * User Service
 * User Service
 *
 * The version of the OpenAPI document: 0.0.1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { Observable } from 'rxjs';
import { BaseAPI, OperationOpts, RawAjaxResponse } from '../runtime';

/**
 * no description
 */
export class DefaultApi extends BaseAPI {

    /**
     */
    appControllerGetData(): Observable<void>
    appControllerGetData(opts?: OperationOpts): Observable<void | RawAjaxResponse<void>>
    appControllerGetData(opts?: OperationOpts): Observable<void | RawAjaxResponse<void>> {
        return this.request<void>({
            url: '/api',
            method: 'GET',
        }, opts?.responseOpts);
    };

    /**
     */
    cognitoTestingControllerLogin(): Observable<void>
    cognitoTestingControllerLogin(opts?: OperationOpts): Observable<void | RawAjaxResponse<void>>
    cognitoTestingControllerLogin(opts?: OperationOpts): Observable<void | RawAjaxResponse<void>> {
        return this.request<void>({
            url: '/api/cognito-testing-login',
            method: 'POST',
        }, opts?.responseOpts);
    };

}
