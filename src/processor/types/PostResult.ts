import { ModalBuilder } from "discord.js";

export type PostResult = {
    success: Boolean;
    content: string;
    isModal: Boolean;
    modal: ModalBuilder | null;
}