import { ApiProperty } from '@nestjs/swagger';

export class BoardColumnModel {
    @ApiProperty({ example: 'a8c0e465-cf47-4b12-bfac-25062a669cf2' })
    id!: string;

    /**
     * Enum value from tg_task_status.
     */
    @ApiProperty({ example: 'todo', enum: ['todo', 'in_progress', 'blocked', 'done'] })
    key!: string;

    @ApiProperty({ example: 'To do' })
    title!: string;

    @ApiProperty({ example: 1 })
    sortOrder!: number;
}
