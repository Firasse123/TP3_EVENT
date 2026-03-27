import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

import { UsersService } from '../users/users.service';
import { CvsService } from '../cvs/cvs.service';
import { SkillsService } from '../skills/skills.service';

import {
  randEmail,
  randUserName,
  randPassword,
  randFirstName,
  randLastName,
  randNumber,
  randJobTitle,
  randSkill,
} from '@ngneat/falso';

import { SkillEntity } from '../skills/entities/skill.entity';
import { UserEntity } from '../users/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userService = app.get(UsersService);
  const cvService = app.get(CvsService);
  const skillService = app.get(SkillsService);


  const skills: SkillEntity[] = [];

  for (let i = 0; i < 5; i++) {
    const skill = await skillService.create({
      designation: randSkill(),
    });
    skills.push(skill);
  }


  const users: UserEntity[] = [];

  for (let i = 0; i < 3; i++) {
    const user = await userService.create({
      username: randUserName(),
      email: randEmail(),
      password: randPassword(),
    });

    const savedUser = await userService.findOne(user.id);

    if (!savedUser) {
      throw new Error('User not found after creation');
    }

    users.push(savedUser);
  }

  console.log('Users created:', users.length);


  for (let i = 0; i < 10; i++) {
    const user = users[Math.floor(Math.random() * users.length)];

    const randomSkills = skills
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    const cv = cvService['repository'].create({
      firstname: randFirstName(),
      name: randLastName(),
      age: randNumber({ min: 18, max: 60 }),
      cin: randNumber({ min: 10000000, max: 99999999 }),
      job: randJobTitle(),
      user: user,
      skills: randomSkills,
    });

    await cvService['repository'].save(cv);
  }

  console.log('Seed terminé');

  await app.close();
}

bootstrap();