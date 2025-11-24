import { UserInsertInterface } from "../../../users/domain/interfaces/UserInsert.interface";
import { UserInterface } from "../../../users/domain/interfaces/User.interface";

export interface UserRepositoryInterface {
  getUsers(): Promise<UserInterface[]>;
  insertUser(user: UserInsertInterface): Promise<UserInterface>;
  findByPhone(phone: string): Promise<UserInterface | null>;
  findByUserId(userId: string): Promise<UserInterface | null>;
  findUsersByIds(userIds: string[]): Promise<{ id: string; phone: string }[]>;
}
