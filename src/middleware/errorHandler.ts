import type { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/errors.js";


export function errorHandle(err: Error, req: Request, res: Response, next: NextFunction){
    if(err instanceof AppError){
        return res.status(err.statusCode).json({error : err.message})
    }
    console.log(err)
    return res.status(500).json({ error: "Something went wrong" })
}

