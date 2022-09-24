import { BaseConfigValidator } from "../interface/BaseConfigValidator";
import { ChannelConfig } from "../service/ChannelConfig";

export class ChannelConfigValidator implements BaseConfigValidator {
    constructor(){}

    validateNew(req: Request, res: Response): boolean {
        throw new Error("Method not implemented.");
    }

    validateUpdate(req: Request, res: Response): boolean {
        throw new Error("Method not implemented.");
    }

    validateDelete(req: Request, res: Response): boolean {
        throw new Error("Method not implemented.");
    }
    
    validateSearch(req: Request, res: Response): boolean {
        throw new Error("Method not implemented.");
    }

    validateSearchList(req: Request, res: Response): boolean {
        throw new Error("Method not implemented.");
    }

}