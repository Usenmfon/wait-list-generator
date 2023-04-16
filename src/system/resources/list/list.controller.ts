import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ListService } from './list.service';
import { JwtAuthGuard } from 'src/helper/guard';
import { GetAuthUser } from 'src/auth/decorators/user.decorator';
import { IAuthUser } from 'src/auth/interfaces';
import { CreateListDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Get()
  async getAllLists() {
    return this.listService.getAllLists();
  }

  @Post()
  async createList(@GetAuthUser() user: IAuthUser, @Body() dto: CreateListDto) {
    return this.listService.createList(user, dto);
  }
}
