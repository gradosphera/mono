/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InstanceDTO } from './InstanceDTO';
import type { OrganizationWithPrivateDataDTO } from './OrganizationWithPrivateDataDTO';
export type InstanceWithOrganizationDTO = {
    /**
     * Instance details
     */
    instance: InstanceDTO;
    /**
     * Organization details, including user and private data
     */
    organization: OrganizationWithPrivateDataDTO;
};

