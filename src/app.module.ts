import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './auth/schema/auth.schema';
import { AuthModule } from './auth/auth.module';
import { ServiceExceptionFilter } from './helper/exceptions/filters/service.exception';
import { Connection } from 'mongoose';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      connectionFactory: (connection: Connection) => {
        return connection;
      },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AuthModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: ServiceExceptionFilter }],
})
export class AppModule {}
