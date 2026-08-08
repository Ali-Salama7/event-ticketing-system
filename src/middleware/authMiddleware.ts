import type { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'

export function authMiddleware(req: Request, res: Response, next: NextFunction){
    const autHeader = req.headers.authorization

    if(!autHeader || !autHeader.startsWith('Bearer ')){
        return res.status(401).json({message: "Authorization is failed"})
    }

    const token = autHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({message: "Token is missing"})
    }
    
    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
        return res.status(500).json({message: "Server configuration error"})
    }

    try {
        const decode = jwt.verify(token, jwtSecret)
        req.user = decode
        next()
    } catch (error) {
        return res.status(403).json({message: "The authorization is invalid or expired."})
    }

}
