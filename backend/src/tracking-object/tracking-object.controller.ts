import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { TrackingObjectService } from './tracking-object.service';
import { CreateTrackingObjectDto } from './dto/create-tracking-object.dto';
import { UpdateTrackingObjectDto } from './dto/update-tracking-object.dto';

@Controller('tracking-objects')
export class TrackingObjectController {
  constructor(private readonly trackingObjectService: TrackingObjectService) {}

  @Post()
  create(@Body(ValidationPipe) createDto: CreateTrackingObjectDto) {
    return this.trackingObjectService.create(createDto);
  }

  @Get()
  findAll() {
    return this.trackingObjectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trackingObjectService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(ValidationPipe) updateDto: UpdateTrackingObjectDto) {
    return this.trackingObjectService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trackingObjectService.remove(id);
  }
}
