export interface BaseConfigValidator {
    validateNew(req: Request, res: Response);
    validateUpdate(req: Request, res: Response);
    validateDelete(req: Request, res: Response);
    validateSearch(req: Request, res: Response);
    validateSearchList(req: Request, res: Response);
}