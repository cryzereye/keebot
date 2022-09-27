const numRegex = new RegExp(/^\d+&/);
const channelNameRegex = new RegExp(/^(\d|\w|_)(\d|\w|_|-){0-99}$/);  // starts with /w /d or _. /w /d - _ only. 100 chars max. no consecutive -
const roleNameRegex = new RegExp(/^.{1-100}$/);

export function validID (id: string): boolean {
    return numRegex.test(id);
} 

export function validChannelName (ch: string): boolean {
    return channelNameRegex.test(ch);
} 

export function validroleName (role: string):boolean {
    return roleNameRegex.test(role);
} 

export function validFilter (filter: number):boolean {
    try{
        filter/1; // test if number
        return (filter > 0); // test if valid filter value
    }
    catch(e){
        return false
    }
} 