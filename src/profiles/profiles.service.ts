import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(
    createProfileDto: CreateProfileDto,
    manager = this.dataSource.manager,
  ) {
    const repo = manager.getRepository(Profile);

    const profile = repo.create({
      user: { id: createProfileDto.userId },
      profession: { id: createProfileDto.professionId },
    });

    await repo.save(profile);
    return profile;
  }

  findAll() {
    return this.profileRepository.find({ relations: ['user', 'profession'] });
  }

  async findOne(id: number) {
    const profile = await this.profileRepository.findOne({
      where: { id },
      relations: ['user', 'profession'],
    });
    if (!profile) {
      throw new NotFoundException(`Profile #${id} not found`);
    }
    return profile;
  }

  async update(id: number, updateProfileDto: UpdateProfileDto) {
    const profile = await this.findOne(id);
    Object.assign(profile, updateProfileDto);
    return this.profileRepository.save(profile);
  }

  async remove(id: number) {
    const profile = await this.findOne(id);
    return this.profileRepository.remove(profile);
  }
}
