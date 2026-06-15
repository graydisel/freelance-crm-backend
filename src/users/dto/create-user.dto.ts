import {IsEmail, IsString, MinLength} from "class-validator";

export class CreateUserDto {
    @IsEmail({}, { message: 'Not correct email format' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
    passwordHash: string;

    firstName: string;
    lastName: string;
    roleName: string;
    companyId?: string;
}