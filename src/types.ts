import { EntityManager } from "typeorm";
import { Request, Response } from "express";

export type MyContext = {
  manager: EntityManager;
  res: Response;
  req: Request;
};
