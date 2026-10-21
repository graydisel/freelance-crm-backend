import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ClientStatus } from '../enums/client-status.enum';

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
  @Transform(({ value, obj }: { value: any; obj: any }) => {
    const raw = value ?? obj?.status;
    if (!raw) return undefined;
    if (Array.isArray(raw)) return raw as unknown[];
    return typeof raw === 'string'
      ? (raw.split(',') as unknown[])
      : ([raw] as unknown[]);
  })
  statuses?: ClientStatus[];

  @IsOptional()
  @IsString()
  status?: string;
}
