import { ApiProperty } from '@nestjs/swagger';
import { TaskModel } from '../../task/models/task.model';

export class BoardColumnModel {
    @ApiProperty({ example: 'a8c0e465-cf47-4b12-bfac-25062a669cf2' })
    id!: string;

    @ApiProperty({ example: 'todo', enum: ['todo', 'in_progress', 'blocked', 'done'] })
    key!: string;

    @ApiProperty({ example: 'To do' })
    title!: string;

    @ApiProperty({ example: 1 })
    sortOrder!: number;

    @ApiProperty({ type: [TaskModel] })
    tasks!: TaskModel[];
}
