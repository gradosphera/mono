/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * @param jobId
     * @returns any
     * @throws ApiError
     */
    public static pregeneratorControllerGetJobStatus(
        jobId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/pregenerator/progress/{jobId}',
            path: {
                'jobId': jobId,
            },
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static pregeneratorControllerGenerateUstavAndProtocol(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/pregenerator/generate/ustav',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static pregeneratorControllerGenerateForms(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/pregenerator/generate/forms',
        });
    }
}
