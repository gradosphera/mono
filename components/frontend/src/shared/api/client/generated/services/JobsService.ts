/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JobEntity } from '../models/JobEntity';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class JobsService {
    /**
     * Получить все задачи
     * @returns JobEntity Возвращает массив задач
     * @throws ApiError
     */
    public static bullControllerGetAllJobs(): CancelablePromise<Array<JobEntity>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/jobs/all',
        });
    }
}
