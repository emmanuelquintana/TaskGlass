import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class TaskStatusDto {
  @ApiProperty({ example: 'todo', description: 'Must be a valid tg_task_status value' })
  @IsIn(['todo', 'doing', 'blocked', 'done'])
  status!: string;
}
