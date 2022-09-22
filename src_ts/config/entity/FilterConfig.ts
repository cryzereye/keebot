import { Config } from '../model/Config';
import { Filter } from '../model/type/Filter';

export class FilterConfig implements Config {
    id: string;
    role: string;
    filter: number;

    constructor(data: Filter) {
        this.setValue(data);
    }

    getValue(id: string) {
        return this.filter;
    }

    setValue(data: Filter) {
        this.id = data.id;
        this.role = data.role;
        this.filter = data.filter;
    }
}