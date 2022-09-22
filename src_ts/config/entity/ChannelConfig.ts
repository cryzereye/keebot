import { Config } from '../model/Config';
import { Channel } from '../model/type/Channel';

export class ChannelConfig implements Config {
    name: string;
    id: string;

    constructor(data: Channel) {
        this.setValue(data);
    }

    getValue() {
        return this.id;
    }

    setValue(data: Channel) {
        this.name = data.name;
        this.id = data.id;
    }
}