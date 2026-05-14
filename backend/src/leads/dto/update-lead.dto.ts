import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { LeadStatus } from '@prisma/client';

export class UpdateLeadDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  // empty string -> null (unassign)
  @IsOptional()
  @ValidateIf((_, v) => v !== '' && v !== null)
  @IsString()
  assigneeId?: string | null;
}
