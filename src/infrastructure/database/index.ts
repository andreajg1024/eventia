import { AppDataSource } from "../../../ormconfig";
export const initDb = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log("Database connected");
  }
};
