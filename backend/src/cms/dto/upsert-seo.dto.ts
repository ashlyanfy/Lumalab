import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertSeoDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(500)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  keywords?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  ogImage?: string;
}
