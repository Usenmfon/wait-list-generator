import { Module } from '@nestjs/common';
import { ProfileModule } from '../resources/profile/profile.module';
import { ListModule } from '../resources/list/list.module';
import { ContactModule } from '../resources/contact/contact.module';

@Module({ imports: [ProfileModule, ListModule, ContactModule] })
export class UserModule {}
