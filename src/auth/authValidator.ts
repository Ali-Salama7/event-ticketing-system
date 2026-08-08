import { BadRequestError } from "../shared/errors.js";

export function validateRegister(data: any){
    if(!data.name || !data.email || !data.password){
        throw new BadRequestError("Name, email and password are required");
        
    }

    if(data.password.length < 6){
        throw new BadRequestError("Password must be at least 6 characters");
        
    }

}

export function validateLogin(data: any){
    if(!data.email || !data.password){
        throw new BadRequestError("Email and password are required");
    }
}
