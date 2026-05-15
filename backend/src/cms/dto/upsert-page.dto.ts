import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpsertPageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  slug!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;
}

export class UpdatePageDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;
}
