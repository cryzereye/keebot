import { Config } from '../interface/Config';
import { Role } from '../model/type/Role';

export class RoleConfig implements Config {
    id: string;

    constructor(data: Role) {
        this.setValue(data);
    }

    getValue(): string {
        return this.id;
    }

    setValue(data: Role): void {
        this.id = data.id;
    }
}