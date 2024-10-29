/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BankAccountDTO } from './BankAccountDTO';
import type { DetailsDTO } from './DetailsDTO';
import type { RepresentedByDTO } from './RepresentedByDTO';
export type OrganizationDataDTO = {
    /**
     * Username of the organization
     */
    username: string;
    /**
     * Type of the organization
     */
    type: OrganizationDataDTO.type;
    /**
     * Is cooperative flag
     */
    is_cooperative: boolean;
    /**
     * Short name of the organization
     */
    short_name: string;
    /**
     * Full name of the organization
     */
    full_name: string;
    /**
     * Representative of the organization
     */
    represented_by: RepresentedByDTO;
    /**
     * Country of the organization
     */
    country: string;
    /**
     * City of the organization
     */
    city: string;
    /**
     * Full address of the organization
     */
    full_address: string;
    /**
     * Phone number of the organization
     */
    phone: string;
    /**
     * Email of the organization
     */
    email: string;
    /**
     * Organization details
     */
    details: DetailsDTO;
    /**
     * Bank account information
     */
    bank_account: BankAccountDTO;
    /**
     * Block number
     */
    block_num?: number;
    /**
     * Is organization deleted
     */
    deleted?: boolean;
};
export namespace OrganizationDataDTO {
    /**
     * Type of the organization
     */
    export enum type {
        COOP = 'coop',
        OOO = 'ooo',
        OAO = 'oao',
        ZAO = 'zao',
        PAO = 'pao',
        AO = 'ao',
    }
}

