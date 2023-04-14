import { Snowflake } from "discord.js";

export type ModalData = {
    postID: Snowflake | undefined;
    roleID: Snowflake | undefined;
    have: string | undefined;
    want: string | undefined;
    imgur: string | undefined;
    details: string | undefined;
}