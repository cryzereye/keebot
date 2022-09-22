import { Config } from '../model/Config';
import { Role } from '../model/type/Role';

export class RoleConfig implements Config {
    id: string;

    constructor(data: Role) {
        this.setValue(data);
    }

    getValue() {
        return this.id;
    }

    setValue(data: Role) {
        this.id = data.id;
    }
}