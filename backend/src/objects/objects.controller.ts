import { Controller, Get, HttpCode, HttpStatus, Sse } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { EventMessageDto, ObjectDto } from './objects.dto';
import { ObjectsService } from './objects.service';
import { ObjectsSseService } from './objects.sse.service';

@ApiTags('Objects')
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
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Connect to event stream' })
    @ApiOkResponse({ description: 'Connected', type: EventMessageDto<ObjectDto> })
    @ApiUnauthorizedResponse()
    stream(): Observable<EventMessageDto<ObjectDto>> {
        return this.objectsSseSvc.createStream();
    }
}
