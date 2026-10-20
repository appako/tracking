import { Controller, Get, HttpCode, HttpStatus, Sse } from '@nestjs/common';
import {
    ApiExtraModels,
    ApiOkResponse,
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { EventCreateObjectDto, EventMessageDto, EventUpdateObjectsDto, ObjectDto } from './objects.dto';
import { ObjectsService } from './objects.service';
import { ObjectsSseService } from './objects.sse.service';

@ApiTags('Objects')
@ApiExtraModels(EventUpdateObjectsDto, EventCreateObjectDto)
@Controller('objects')
export class ObjectsController {
    constructor(
        private readonly objectsSvc: ObjectsService,
        private readonly objectsSseSvc: ObjectsSseService,
    ) {}

    @Get('list')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get list of objects' })
    @ApiResponse({ status: 200, type: ObjectDto, isArray: true })
    @ApiUnauthorizedResponse()
    getList(): ObjectDto[] {
        return this.objectsSvc.getList();
    }

    @Sse('stream')
    @ApiOperation({ summary: 'Connect to event stream' })
    @ApiOkResponse({ description: 'Connected', type: EventMessageDto })
    @ApiUnauthorizedResponse()
    stream(): Observable<EventMessageDto> {
        return this.objectsSseSvc.createStream();
    }
}
