/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActivateDto } from '../models/ActivateDto';
import type { Instance } from '../models/Instance';
import type { InstanceWithOrganizationDTO } from '../models/InstanceWithOrganizationDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InstancesService {
    /**
     * Получить все инстансы
     * @returns Instance Возвращает массив инстансов
     * @throws ApiError
     */
    public static instanceControllerGetAllInstances(): CancelablePromise<Array<Instance>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/instances/all',
        });
    }
    /**
     * Получить инстанс по username
     * @param username Имя пользователя
     * @returns InstanceWithOrganizationDTO Возвращает инстанс
     * @throws ApiError
     */
    public static instanceControllerGetInstance(
        username: string,
    ): CancelablePromise<InstanceWithOrganizationDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/instances/{username}',
            path: {
                'username': username,
            },
            errors: {
                404: `Инстанс не найден`,
            },
        });
    }
    /**
     * Активировать инстанс по username
     * @param requestBody
     * @returns InstanceWithOrganizationDTO Инстанс активирован
     * @throws ApiError
     */
    public static instanceControllerActivate(
        requestBody: ActivateDto,
    ): CancelablePromise<InstanceWithOrganizationDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/instances/{username}/activate',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Инстанс не найден`,
            },
        });
    }
}
