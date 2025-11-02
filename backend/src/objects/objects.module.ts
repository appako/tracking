import { Module } from '@nestjs/common';
import { GeojsonService } from '../common/geojson.service';
import { PubSubService } from '../common/pubsub.service';
import { ObjectsController } from './objects.controller';
import { ObjectsService } from './objects.service';
import { ObjectsSseService } from './objects.sse.service';

@Module({
    controllers: [ObjectsController],
    providers: [ObjectsService, ObjectsSseService, GeojsonService, PubSubService],
})
export class ObjectsModule {}
