import { IsEnum, IsInt, IsOptional, IsString, Min, IsArray } from "class-validator";
import { Type, Transform } from "class-transformer";
import { ClientStatus } from "../enums/client-status.enum";

export class GetClientsFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(ClientStatus, { each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    return typeof value === 'string' ? value.split(',') : [value];
  })
  statuses?: ClientStatus[];
}
