import { MessageEvent } from '@nestjs/common';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

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
    UPDATE_OBJECT = 'UPDATE_OBJECT',
    ADD_OBJECT = 'ADD_OBJECT',
}

export class EventUpdateObjectDto {
    @IsObject()
    @ApiProperty({ type: ObjectDto })
    value!: ObjectDto;

    @IsEnum(EventMessageKeyEnum)
    @ApiProperty({ enum: EventMessageKeyEnum, enumName: 'EventMessageKeyEnum' })
    type: EventMessageKeyEnum.UPDATE_OBJECT = EventMessageKeyEnum.UPDATE_OBJECT;
}

export class EventCreateObjectDto {
    @IsObject()
    @ApiProperty({ type: ObjectDto })
    value!: ObjectDto;

    @IsEnum(EventMessageKeyEnum)
    @ApiProperty({ enum: EventMessageKeyEnum, enumName: 'EventMessageKeyEnum' })
    type: EventMessageKeyEnum.ADD_OBJECT = EventMessageKeyEnum.ADD_OBJECT;
}

export class EventMessageDto<T> implements Omit<MessageEvent, 'data'> {
    @IsObject()
    @ApiProperty({
        type: () => Object,
        oneOf: [{ $ref: getSchemaPath(EventUpdateObjectDto) }, { $ref: getSchemaPath(EventCreateObjectDto) }],
    })
    data!: {
        type: EventMessageKeyEnum;
        value: T;
    };

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
