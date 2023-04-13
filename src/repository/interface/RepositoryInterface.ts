
export interface RepositoryInterface {
    save(dataDump: any): void;
    load(): any;
}