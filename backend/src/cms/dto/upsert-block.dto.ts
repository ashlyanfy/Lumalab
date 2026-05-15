import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateBlockDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  type!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsObject()
  data!: Record<string, unknown>;
}

export class UpdateBlockDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  type?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}

class ReorderItem {
  @IsInt()
  id!: number;

  @IsInt()
  @Min(0)
  order!: number;
}

export class ReorderBlocksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItem)
  items!: ReorderItem[];
}
