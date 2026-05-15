import { Type } from 'class-transformer';
import { IsObject, IsString, MinLength, ValidateNested } from 'class-validator';

class PushKeys {
  @IsString()
  @MinLength(1)
  p256dh!: string;

  @IsString()
  @MinLength(1)
  auth!: string;
}

export class SubscribePushDto {
  @IsString()
  @MinLength(1)
  endpoint!: string;

  @ValidateNested()
  @Type(() => PushKeys)
  @IsObject()
  keys!: PushKeys;
}

export class UnsubscribePushDto {
  @IsString()
  @MinLength(1)
  endpoint!: string;
}
