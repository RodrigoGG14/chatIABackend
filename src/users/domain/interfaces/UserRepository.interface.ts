import { UserInterface } from "@/users/domain/interfaces/User.interface";

export interface UserRepositoryInterface {
    getUsers(): Promise<UserInterface[]>;
}