import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingObjectService } from './tracking-object.service';
import { TrackingObjectController } from './tracking-object.controller';
import { TrackingObject } from './tracking-object.entity';
import { TrackingObjectGateway } from './tracking-object.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([TrackingObject])],
  controllers: [TrackingObjectController],
  providers: [TrackingObjectService, TrackingObjectGateway],
  exports: [TrackingObjectService],
})
export class TrackingObjectModule {}
