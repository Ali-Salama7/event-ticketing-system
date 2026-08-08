export class AppError extends Error{
    statusCode: number
    constructor(message: string, statusCode: number){
        super(message)
        this.statusCode = statusCode
    }
}

export class NotFoundError extends AppError{
    constructor(message: string = "Resource not found"){
        super(message, 404)
    }
}

export class BadRequestError extends AppError{
    constructor(message: string){
        super(message, 400)
    }
}

export class UnauthorizedError extends AppError{
    constructor(message: string = "Unauthorized"){
        super(message, 401)
    }
}

export class ForbiddenError extends AppError{
    constructor(message: string = "Forbidden"){
        super(message, 403)
    }
}