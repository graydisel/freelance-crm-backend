import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfileEntity } from './user-profiles.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserProfilesService {
  constructor(
    @InjectRepository(UserProfileEntity)
    private readonly userProfilesRepository: Repository<UserProfileEntity>,
  ) { }

  async getProfileByUserId(userId: string): Promise<UserProfileEntity> {
    const profile = await this.userProfilesRepository.findOne({
      where: { id: userId },
    });
    if (!profile) {
      throw new NotFoundException('User profile with not found');
    }
    return profile;
  }

  async updateProfile(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<UserProfileEntity> {
    const profile = await this.getProfileByUserId(userId);

    if (dto.firstName) profile.firstName = dto.firstName;
    if (dto.lastName) profile.lastName = dto.lastName;

    return this.userProfilesRepository.save(profile);
  }
}
