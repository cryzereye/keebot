export interface FileImporterInterface {
    save(dataDump: any): void;
    load(): any;
}