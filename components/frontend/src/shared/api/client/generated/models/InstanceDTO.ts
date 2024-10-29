/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type InstanceDTO = {
    /**
     * Username of the instance
     */
    username: string;
    /**
     * Status of the instance
     */
    status: string;
    /**
     * Is the instance valid
     */
    is_valid: boolean;
    /**
     * Ansible host for the instance
     */
    ansible_host: string;
    /**
     * Ansible user for the instance
     */
    ansible_user: string;
    /**
     * Domain of the instance
     */
    domain: string;
    /**
     * Punycode domain of the instance
     */
    puny_domain: string;
    /**
     * Email associated with the instance
     */
    email: string;
    /**
     * Port used by the instance
     */
    port: number;
    /**
     * Run parser status
     */
    run_parser: boolean;
    /**
     * Title of the instance
     */
    title: string;
    /**
     * Description of the instance
     */
    description: string;
    /**
     * Image URL of the instance
     */
    image: string;
    /**
     * Mono directory of the instance
     */
    mono_dir: string;
    /**
     * Inventory file for the instance
     */
    inventory: string;
    /**
     * Flag indicating if the instance starts on boot
     */
    on_start: boolean;
    /**
     * Flag indicating if the instance stops on shutdown
     */
    on_stop: boolean;
    /**
     * Is transfer process active
     */
    is_transfer: boolean;
    /**
     * Instance creation timestamp
     */
    createdAt: string;
    /**
     * Instance last update timestamp
     */
    updatedAt: string;
};

