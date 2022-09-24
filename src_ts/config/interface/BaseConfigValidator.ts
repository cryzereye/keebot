export interface BaseConfigValidator {
    validateNew(req: Request, res: Response): boolean;
    validateUpdate(req: Request, res: Response): boolean;
    validateDelete(req: Request, res: Response): boolean;
    validateSearch(req: Request, res: Response): boolean;
    validateSearchList(req: Request, res: Response): boolean;
}