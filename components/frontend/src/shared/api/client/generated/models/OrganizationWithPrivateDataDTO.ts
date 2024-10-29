/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrganizationDataDTO } from './OrganizationDataDTO';
export type OrganizationWithPrivateDataDTO = {
    /**
     * Username of the organization user
     */
    username: string;
    /**
     * Role of the user
     */
    role: string;
    /**
     * Email of the user
     */
    email: string;
    /**
     * Private data of the organization
     */
    private_data: OrganizationDataDTO;
};

