import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateTrackingObjectDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
