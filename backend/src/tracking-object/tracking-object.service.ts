import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackingObject } from './tracking-object.entity';
import { CreateTrackingObjectDto } from './dto/create-tracking-object.dto';
import { UpdateTrackingObjectDto } from './dto/update-tracking-object.dto';

@Injectable()
export class TrackingObjectService {
  constructor(
    @InjectRepository(TrackingObject)
    private trackingObjectRepository: Repository<TrackingObject>,
  ) {}

  async create(createDto: CreateTrackingObjectDto): Promise<TrackingObject> {
    const trackingObject = this.trackingObjectRepository.create(createDto);
    return this.trackingObjectRepository.save(trackingObject);
  }

  async findAll(): Promise<TrackingObject[]> {
    return this.trackingObjectRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<TrackingObject> {
    const trackingObject = await this.trackingObjectRepository.findOne({
      where: { id },
    });
    if (!trackingObject) {
      throw new NotFoundException(`Tracking object with ID ${id} not found`);
    }
    return trackingObject;
  }

  async update(id: string, updateDto: UpdateTrackingObjectDto): Promise<TrackingObject> {
    const trackingObject = await this.findOne(id);
    Object.assign(trackingObject, updateDto);
    return this.trackingObjectRepository.save(trackingObject);
  }

  async remove(id: string): Promise<void> {
    const trackingObject = await this.findOne(id);
    await this.trackingObjectRepository.remove(trackingObject);
  }
}
