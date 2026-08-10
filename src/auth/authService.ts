import prisma from "../config/db.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { BadRequestError, UnauthorizedError } from "../shared/errors.js";

export class AuthService{
    async registerUser(userData: {name: string, email: string, password: string}){
        const existUser = await prisma.user.findUnique({
            where: {email: userData.email}
        })

        if(existUser){
            throw new BadRequestError("Email is already in use");
        }

        const hashPasword = await bcrypt.hash(userData.password, 10)

        const newUser = await prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                password: hashPasword
            }
        })

        const {password, ...userWithoutPassword} = newUser
        return userWithoutPassword

    }

    async loginUser(userData: {email: string, password: string}){
        const user = await prisma.user.findUnique({
            where: {email: userData.email}
        })
        if(!user){
            throw new UnauthorizedError("Invalid email or password");
        }

        const passwordIsvalid = await bcrypt.compare(userData.password, user.password) 
        if(!passwordIsvalid){
            throw new UnauthorizedError("Invalid email or password");
        }

        const token = jwt.sign(
            {userId: user.id, role: user.role},
            process.env.JWT_SECRET as string,
            {expiresIn: "7d"}
        )

        const {password, ...userWithoutPassword} = user
        return {user: userWithoutPassword, token}

    }
}