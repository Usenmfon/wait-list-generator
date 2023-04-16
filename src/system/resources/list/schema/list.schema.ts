import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/auth/schema/auth.schema';

@Schema({ timestamps: true })
export class List {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  description: string;
}

export type ListDocument = HydratedDocument<List>;
export const ListSchema = SchemaFactory.createForClass(List);
