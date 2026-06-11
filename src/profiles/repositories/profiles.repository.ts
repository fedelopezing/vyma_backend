import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Profile } from '../entities/profile.entity';
import { CreateProfileDto } from '../dto/create-profile.dto';

@Injectable()
export class ProfilesRepository {
  constructor(
    @InjectRepository(Profile)
    private readonly repository: Repository<Profile>,
  ) {}

  async createProfile(
    createProfileDto: CreateProfileDto,
    manager?: EntityManager,
  ): Promise<Profile> {
    const repo = manager ? manager.getRepository(Profile) : this.repository;

    const profile = repo.create({
      user: { id: createProfileDto.userId },
      profession: { id: createProfileDto.professionId },
    });

    return repo.save(profile);
  }

  async findAll(): Promise<Profile[]> {
    return this.repository.find({ relations: ['user', 'profession'] });
  }

  async findOneById(id: number): Promise<Profile | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'profession'],
    });
  }

  async save(profile: Profile): Promise<Profile> {
    return this.repository.save(profile);
  }

  async remove(profile: Profile): Promise<Profile> {
    return this.repository.remove(profile);
  }
}
