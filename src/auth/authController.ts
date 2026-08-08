import type { Request, Response, NextFunction } from "express";
import { AuthService } from "./authService.js";
import { validateLogin, validateRegister } from "./authValidator.js";


const authService = new AuthService()

export class AuthController{
    async register(req: Request, res: Response, next: NextFunction){
        try {
            validateRegister(req.body)
            const newUser = await authService.registerUser(req.body)
            return res.status(201).json({
                message: "User registered successfully",
                data: newUser
            })
        } catch (error: any) {            
            next(error)
        }
    }

    async login(req: Request, res: Response, next: NextFunction){
        try {
            validateLogin(req.body)
            const user = await authService.loginUser(req.body)
            return res.status(200).json({
                message: "User logged in",
                data: user
            })
        } catch (error) {
            next(error)
        }
    }

}