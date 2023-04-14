import { StateType } from "./types/StateType.js";

export class State implements StateType {
    name: string;
    value: string | number | Date;

    constructor(name: string, value: string | number | Date) {
        this.name = name;
        this.value = value;
    }

    update(value: string | number | Date) {
        this.value = value;
    }
}