import {
  IsEmail,
  IsEnum,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { LeadKind } from '@prisma/client';

/**
 * Public lead-submission DTO.
 *
 * Two form kinds (COMPANY / TALENT) share the same endpoint. Discriminator-
 * specific fields (e.g. companyName for COMPANY, desiredRole for TALENT) are
 * accepted as top-level optional columns; everything else lands in `data`.
 * The service does kind-specific minimum-field validation.
 */
export class CreateLeadDto {
  @IsEnum(LeadKind)
  kind!: LeadKind;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  contactName!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  whatsapp?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  comment?: string;

  @IsOptional()
  @IsIn(['ru', 'en'])
  locale?: string;

  // Honeypot — must be empty
  @IsOptional()
  @IsString()
  @MaxLength(0)
  botField?: string;

  // ---- COMPANY-specific top-level (all optional, no field is required by the schema) ----
  @IsOptional() @IsString() @MaxLength(200) companyName?: string;
  @IsOptional() @IsString() @MaxLength(500) companySite?: string;
  @IsOptional() @IsString() @MaxLength(200) industry?: string;
  @IsOptional() @IsString() @MaxLength(50) stage?: string;
  @IsOptional() @IsString() @MaxLength(50) revenueRange?: string;
  @IsOptional() @IsString() @MaxLength(50) equityReady?: string;

  // ---- TALENT-specific top-level ----
  @IsOptional() @IsString() @MaxLength(50) desiredRole?: string;
  @IsOptional() @IsString() @MaxLength(50) workFormat?: string;
  @IsOptional() @IsString() @MaxLength(200) country?: string;

  // Remaining payload: textareas, links, etc.
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}
