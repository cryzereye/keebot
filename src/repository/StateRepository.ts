
import { State } from '../models/State.js';
import { BaseRepository } from './BaseRepository.js';

export class StateRepository extends BaseRepository {
    cache: Array<State>;
    constructor() {
        super(`json/state.json`);
        this.cache = <Array<State>>this.load();
    }

    new(state: State): void {
        this.cache.push(state);
        this.save(this.cache.toString());
    }

    update(name: string, value: string | number | Date): void {
        const state = this.find(name);
        if (!state) return;

        const index = this.cache.indexOf(state)
        this.cache[index].value = value;

        this.save(this.cache.toString());
    }

    find(name: string): State | undefined {
        return this.cache.find(state => state.name === name);
    }
}


