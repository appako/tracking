import { PartialType } from '@nestjs/mapped-types';
import { CreateTrackingObjectDto } from './create-tracking-object.dto';

export class UpdateTrackingObjectDto extends PartialType(CreateTrackingObjectDto) {}
