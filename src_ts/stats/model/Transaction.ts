import { User } from "../model/User.js";

export type Transaction =  {
    user: User; // transaction with user
    count: number; // number of transaction instaces
}