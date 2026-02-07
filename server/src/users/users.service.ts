import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  create(username: string, passwordHash: string): Promise<User> {
    const user = this.usersRepository.create({ username, passwordHash });
    return this.usersRepository.save(user);
  }

  async addCompanyToUserById(
    userId: string,
    companyId: string,
  ): Promise<User | null> {
    console.log(`Adding company ${companyId} to user ${userId}`);
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) return null;
    user.companies = user.companies || [];
    const cleanId = (companyId || '').replace(/["\\]/g, '').trim();
    if (!user.companies.includes(cleanId)) {
      user.companies.push(cleanId);
      await this.usersRepository.save(user);
    }
    return user;
  }
}
