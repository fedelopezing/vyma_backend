import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreateProfileDto, UpdateProfileDto } from './dto';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProfileDto: CreateProfileDto, manager = this.dataSource.manager) {
    const repo = manager.getRepository(Profile);

    const profile = repo.create({
      user: { id: createProfileDto.userId },
      profession: { id: createProfileDto.professionId },
    });

    await repo.save(profile);
    return profile;
  }

  findAll() {
    return this.profileRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} profile`;
  }

  update(id: number, updateProfileDto: UpdateProfileDto) {
    return `This action updates a #${id} profile`;
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
