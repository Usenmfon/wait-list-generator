import { Module } from '@nestjs/common';
import { ProfileModule } from '../resources/profile/profile.module';
import { ListModule } from '../resources/list/list.module';

@Module({ imports: [ProfileModule, ListModule] })
export class UserModule {}
