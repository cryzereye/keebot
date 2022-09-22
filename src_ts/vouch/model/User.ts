import type { Points } from "./Points";
import type { Transaction } from "./Transaction";

export interface User {
    id: string; // id of the user
    username: string; // current username of the user
    points : Points; // points of the user
    transactions: Array<Transaction>; // transactions array
    created: Date; // when the user account was created
    joined: Date; // when the user joined the server
}