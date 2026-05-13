// Manually authored — backend at apps/media-svc/.../admin.controller.ts.
// Mirrors the auto-generated rxjs-api style; until the next openapi
// regeneration, this file is the canonical declaration.
import { Observable } from 'rxjs';
import {
  BaseAPI,
  HttpHeaders,
  OperationOpts,
  RawAjaxResponse,
} from '../runtime';

/**
 * One entry in the admin "Reported Content" roster. Includes the
 * reports array + a `reporters` array joined from the user
 * collection (in same order as report.reporterSub).
 */
export interface ReportedContentItem {
  _id: string;
  contentType: 'mediaItem' | 'playlistItem';
  title?: string;
  imageSrc?: string;
  uri?: string;
  createdBy?: string;
  isSuspended?: boolean;
  reportedCount?: number;
  reports?: Array<{
    reason?: string;
    comment?: string;
    reporterSub?: string;
    reportedAt?: string;
  }>;
  reporters?: Array<{
    _id?: string;
    sub?: string;
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    imageSrc?: string;
  }>;
  uploader?: {
    _id?: string;
    sub?: string;
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    imageSrc?: string;
    isDisabled?: boolean;
  } | null;
}

export interface ReporterAbuseGroup {
  reporterSub: string;
  reportCount: number;
  reports: Array<{
    itemId: string;
    title?: string;
    imageSrc?: string;
    uri?: string;
    contentType: 'mediaItem' | 'playlistItem';
    uploaderSub?: string;
    uploader?: {
      _id?: string;
      sub?: string;
      email?: string;
      username?: string;
      firstName?: string;
      lastName?: string;
      imageSrc?: string;
      isDisabled?: boolean;
    } | null;
    reason?: string;
    comment?: string;
    reportedAt?: string;
  }>;
  user?: {
    _id?: string;
    sub?: string;
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    imageSrc?: string;
    isDisabled?: boolean;
    isAdmin?: boolean;
  } | null;
}

export class AdminApi extends BaseAPI {
  adminControllerListReportsByUser(): Observable<Array<ReporterAbuseGroup>>;
  adminControllerListReportsByUser(
    opts?: OperationOpts
  ): Observable<RawAjaxResponse<Array<ReporterAbuseGroup>>>;
  adminControllerListReportsByUser(
    opts?: OperationOpts
  ): Observable<
    Array<ReporterAbuseGroup> | RawAjaxResponse<Array<ReporterAbuseGroup>>
  > {
    const headers: HttpHeaders = {
      ...(this.configuration.username != null &&
      this.configuration.password != null
        ? {
            Authorization: `Basic ${btoa(
              this.configuration.username + ':' + this.configuration.password
            )}`,
          }
        : undefined),
    };
    return this.request<Array<ReporterAbuseGroup>>(
      {
        url: '/api/admin/reports-by-user',
        method: 'GET',
        headers,
      },
      opts?.responseOpts
    );
  }

  adminControllerListReports(): Observable<Array<ReportedContentItem>>;
  adminControllerListReports(
    opts?: OperationOpts
  ): Observable<RawAjaxResponse<Array<ReportedContentItem>>>;
  adminControllerListReports(
    opts?: OperationOpts
  ): Observable<
    Array<ReportedContentItem> | RawAjaxResponse<Array<ReportedContentItem>>
  > {
    const headers: HttpHeaders = {
      ...(this.configuration.username != null &&
      this.configuration.password != null
        ? {
            Authorization: `Basic ${btoa(
              this.configuration.username + ':' + this.configuration.password
            )}`,
          }
        : undefined),
    };
    return this.request<Array<ReportedContentItem>>(
      {
        url: '/api/admin/reports',
        method: 'GET',
        headers,
      },
      opts?.responseOpts
    );
  }
}
