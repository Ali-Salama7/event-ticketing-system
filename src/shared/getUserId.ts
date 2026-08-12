import type { Request } from "express";
import { UnauthorizedError } from "./errors.js";
import type { JwtPayload } from "jsonwebtoken";

export function getUserId(req: Request) {
    const user = req.user

    if(!user || typeof user === 'string'){
        throw new UnauthorizedError("Unauthorized")
    }

    return (user as JwtPayload).userId

}