import { Config } from '../interface/Config';
import { Channel } from '../model/type/Channel';

export class ChannelConfig implements Config {
    name: string;
    id: string;

    constructor(data: Channel) {
        this.setValue(data);
    }

    getValue(): string {
        return this.id;
    }

    setValue(data: Channel): void {
        this.name = data.name;
        this.id = data.id;
    }
}