import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ProfilesRepository } from './repositories/profiles.repository';

import { CreateProfileDto, UpdateProfileDto } from './dto';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfilesService {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async create(
    createProfileDto: CreateProfileDto,
    manager?: EntityManager,
  ): Promise<Profile> {
    return this.profilesRepository.createProfile(createProfileDto, manager);
  }

  findAll(): Promise<Profile[]> {
    return this.profilesRepository.findAll();
  }

  async findOne(id: number): Promise<Profile> {
    const profile = await this.profilesRepository.findOneById(id);
    if (!profile) {
      throw new NotFoundException(`Profile #${id} not found`);
    }
    return profile;
  }

  async update(
    id: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    const profile = await this.findOne(id);
    Object.assign(profile, updateProfileDto);
    return this.profilesRepository.save(profile);
  }

  async remove(id: number): Promise<Profile> {
    const profile = await this.findOne(id);
    return this.profilesRepository.remove(profile);
  }
}
