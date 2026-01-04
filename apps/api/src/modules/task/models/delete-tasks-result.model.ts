import { ApiProperty } from '@nestjs/swagger';

export class DeleteTasksResultModel {
    @ApiProperty()
    count!: number;
}
