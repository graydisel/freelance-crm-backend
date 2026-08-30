import { Transform, TransformFnParams } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateUserDto {
    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsString()
    @IsNotEmpty()
    lastName: string;
}