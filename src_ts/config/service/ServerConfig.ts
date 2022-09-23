import { ConfigType } from '../model/enums/ConfigType';
import { ChannelConfig } from './ChannelConfig';
import { RoleConfig } from './RoleConfig';
import { FilterConfig } from './FilterConfig';
import { Channel } from '../model/type/Channel';
import { Role } from '../model/type/Role';
import { Filter } from '../model/type/Filter';
import { Config } from '../interface/Config';

export class ServerConfig implements Config{
    serverID: string;
    channels: Array<ChannelConfig>;
    roles: Array<RoleConfig>;
    filters: Array<FilterConfig>;

    constructor(data: ServerConfig) {
        this.setValue(data);
    }

    getValue(): ServerConfig {
        return this;
    }

    setValue(data: ServerConfig) {
        this.serverID = data.serverID;
        this.channels = data.channels;
        this.roles = data.roles;
        this.filters = data.filters;
    }

    addProperty(type: ConfigType, value: Object): void {
        try {
            switch (type) {
                case ConfigType.Channel: {
                    let data = value as Channel;
                    this.channels.push(new ChannelConfig(data));
                }
                case ConfigType.Role: {
                    let data = value as Role;
                    this.roles.push(new RoleConfig(data));
                }
                case ConfigType.Filter: {
                    let data = value as Filter;
                    this.filters.push(new FilterConfig(data));
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    getConfigValue(type: ConfigType, property: string): any {
        switch (type) {
            case ConfigType.Channel: return this.channels.filter(ch => ch.name === property)[0].id;
            case ConfigType.Role: return this.roles.filter(r => r.id === property)[0].id;
            case ConfigType.Filter: return this.filters.filter(f => f.id === property)[0].filter;
        }
    }
}