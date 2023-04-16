import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  async getAllContacts() {
    return this.contactService.getAllContacts();
  }

  @Post(':user_id/:list_id')
  async createContact(@Body() dto: CreateContactDto, @Param() params: string) {
    return this.contactService.createContact(dto, params);
  }
}
