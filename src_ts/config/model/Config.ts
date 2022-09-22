export interface Config {
    getValue: (property: string) => any;
    setValue: (data: any) => void;
}