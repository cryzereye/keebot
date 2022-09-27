import { BaseConfigValidator } from "../interface/BaseConfigValidator";
import { RoleConfig } from "../service/RoleConfig";
import { validID } from "../utils/Utilities";

export class RoleConfigValidator implements BaseConfigValidator {
    constructor() { }

    validateNew(req: Request, res: Response) {

    }

    validateUpdate(req: Request, res: Response) {
        throw new Error("Method not implemented.");
    }

    validateDelete(req: Request, res: Response) {
        throw new Error("Method not implemented.");
    }
    
    validateSearch(req: Request, res: Response) {
        throw new Error("Method not implemented.");
    }

    validateSearchList(req: Request, res: Response) {
        throw new Error("Method not implemented.");
    }
}