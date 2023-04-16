import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/auth/schema/auth.schema';
import { List } from '../../list/schema/list.schema';
import { isEmail } from 'class-validator';

@Schema({ timestamps: true })
export class Contact {
  @Prop({ type: Types.ObjectId, ref: 'User', require: true })
  user: User;

  @Prop({ type: Types.ObjectId, ref: 'List', require: true })
  list: List;

  @Prop({
    type: String,
    validate: [
      { validator: isEmail, message: () => 'please enter a valid email' },
    ],
  })
  email: string;

  @Prop({ type: String })
  phoneNumber: string;
}

export type ContactDocument = HydratedDocument<Contact>;
export const ContactSchema = SchemaFactory.createForClass(Contact);
