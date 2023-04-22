import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ListService } from './list.service';
import { JwtAuthGuard } from 'src/helper/guard';
import { GetAuthUser } from 'src/auth/decorators/user.decorator';
import { IAuthUser } from 'src/auth/interfaces';
import { CreateListDto } from './dto';
import { Types } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Get('all')
  async getAllLists() {
    return this.listService.getAllLists();
  }

  @Get(':id')
  async getList(@Param() params: Types.ObjectId) {
    return this.listService.getList(params.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async createList(
    @GetAuthUser() user: IAuthUser,
    @Body() dto: CreateListDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.listService.createList(user, dto, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@GetAuthUser() user: IAuthUser, @Param() params: string) {
    return this.listService.deleteList(user, params);
  }
}
