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

  create(username: string, passwordHash: string): Promise<User> {
    const user = this.usersRepository.create({ username, passwordHash });
    return this.usersRepository.save(user);
  }

  async addCompanyToUserById(
    userId: string,
    companyId: string,
  ): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) return null;
    user.companies = user.companies || [];
    if (!user.companies.includes(companyId)) {
      user.companies.push(companyId);
      await this.usersRepository.save(user);
    }
    return user;
  }

  async addCompanyToUserByUsername(
    username: string,
    companyId: string,
  ): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) return null;
    user.companies = user.companies || [];
    if (!user.companies.includes(companyId)) {
      user.companies.push(companyId);
      await this.usersRepository.save(user);
    }
    return user;
  }
}
