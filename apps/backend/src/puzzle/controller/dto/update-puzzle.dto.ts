import { PartialType } from "@nestjs/mapped-types";

import { CreatePuzzleDto } from "./create-puzzle.dto.js";

export class UpdatePuzzleDto extends PartialType(CreatePuzzleDto) {}