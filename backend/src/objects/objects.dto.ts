import { MessageEvent } from '@nestjs/common';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class ObjectDto {
    @ApiProperty({ description: 'Unique identifier' })
    @IsUUID()
    id!: string;

    @ApiProperty({ description: 'Latitude coordinate' })
    @IsNumber()
    latitude!: number;

    @ApiProperty({ description: 'Longitude coordinate' })
    @IsNumber()
    longitude!: number;

    @ApiProperty({ description: 'Movement direction in degrees (0-360)' })
    @IsNumber()
    direction!: number;

    @ApiProperty({ description: 'Object creation timestamp' })
    createdAt!: Date;

    @ApiProperty({ description: 'Last update timestamp' })
    updatedAt!: Date;
}

export enum EventMessageTypeEnum {
    message = 'message',
    heartbeat = 'heartbeat',
}

export enum EventMessageKeyEnum {
    UPDATE_OBJECTS = 'UPDATE_OBJECTS',
    ADD_OBJECT = 'ADD_OBJECT',
}

export class EventUpdateObjectsDto {
    @IsArray()
    @ApiProperty({ type: ObjectDto, isArray: true })
    value!: ObjectDto[];

    @IsEnum(EventMessageKeyEnum)
    @ApiProperty({ enum: EventMessageKeyEnum, enumName: 'EventMessageKeyEnum' })
    type: EventMessageKeyEnum.UPDATE_OBJECTS = EventMessageKeyEnum.UPDATE_OBJECTS;
}

export class EventCreateObjectDto {
    @IsObject()
    @ApiProperty({ type: ObjectDto })
    value!: ObjectDto;

    @IsEnum(EventMessageKeyEnum)
    @ApiProperty({ enum: EventMessageKeyEnum, enumName: 'EventMessageKeyEnum' })
    type: EventMessageKeyEnum.ADD_OBJECT = EventMessageKeyEnum.ADD_OBJECT;
}

export type EventMessageData = EventUpdateObjectsDto | EventCreateObjectDto;

export class EventMessageDto implements Omit<MessageEvent, 'data'> {
    @IsObject()
    @IsOptional()
    @ApiProperty({
        nullable: true,
        description: 'Event payload; null for heartbeat events',
        oneOf: [{ $ref: getSchemaPath(EventUpdateObjectsDto) }, { $ref: getSchemaPath(EventCreateObjectDto) }],
    })
    data!: EventMessageData | null;

    @IsString()
    @ApiProperty()
    id!: string;

    @IsString()
    @ApiProperty({ enum: EventMessageTypeEnum, enumName: 'EventMessageTypeEnum' })
    type!: keyof typeof EventMessageTypeEnum;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ required: false })
    retry?: number;
}
