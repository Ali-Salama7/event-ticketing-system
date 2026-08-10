import type { Request, Response, NextFunction } from "express";

export function adminMiddleware(req: Request, res: Response, next: NextFunction){
    const user = req.user

    if(!user || typeof user === 'string' || user.role !== "ADMIN"){
        return res.status(403).json({message: "Access denied. Admin only."})
    }

    return next()
}