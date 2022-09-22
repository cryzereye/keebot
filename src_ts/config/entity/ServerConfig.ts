import { ConfigType } from '../model/enums/ConfigType';
import { ChannelConfig } from './ChannelConfig';
import { RoleConfig } from './RoleConfig';
import { FilterConfig } from './FilterConfig';
import { Channel } from '../model/type/Channel';
import { Role } from '../model/type/Role';
import { Filter } from '../model/type/Filter';

export class ServerConfig {
    serverID: string;
    channels: Array<ChannelConfig>;
    roles: Array<RoleConfig>;
    filters: Array<FilterConfig>;

    constructor(serverID: string, channels: Array<ChannelConfig>, roles: Array<RoleConfig>, filters: Array<FilterConfig>) {
        this.serverID = serverID;
        this.channels = channels;
        this.roles = roles;
        this.filters = filters;
    }

    addProperty(type: ConfigType, value: Object) {
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

    getValue(type: ConfigType, property: string): any {
        switch (type) {
            case ConfigType.Channel: return this.channels.filter(ch => ch.name === property)[0].id;
            case ConfigType.Role: return this.roles.filter(r => r.id === property)[0].id;
            case ConfigType.Filter: return this.filters.filter(f => f.id === property)[0].filter;
        }
    }
}