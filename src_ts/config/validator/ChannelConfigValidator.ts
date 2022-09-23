import { BaseConfigValidator } from "../interface/BaseConfigValidator";
import { ChannelConfig } from "../service/ChannelConfig";

export class ChannelConfigValidator implements BaseConfigValidator {
    validateConfig(data: ChannelConfig): boolean {
        throw new Error("Method not implemented.");
    }
    validateID(id: string): boolean {
        throw new Error("Method not implemented.");
    }
    validateName(name: string): boolean {
        throw new Error("Method not implemented.");
    }
    validateNumber(number: number): boolean {
        throw new Error("Method not implemented.");
    }
}