import { ConfigType } from '../enums/ConfigType';

export interface Config {
    channels: {};
    roles: {};
    filters: {};

    getValue(ConfigType, property, value): string | number | string[];
    setValue(ConfigType, property, value): null;
}