import { ModalBuilder } from "discord.js";

export type PostResult = {
    success: boolean;
    content: string;
    isModal: boolean;
    modal: ModalBuilder | null;
}