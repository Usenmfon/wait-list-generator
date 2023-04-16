import { Module } from '@nestjs/common';
import { ListController } from './list.controller';
import { ListService } from './list.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/schema/auth.schema';
import { List, ListSchema } from './schema/list.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: List.name, schema: ListSchema },
    ]),
  ],
  controllers: [ListController],
  providers: [ListService],
})
export class ListModule {}
