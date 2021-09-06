import mongoose from "mongoose";

export function getMongooseId(): string {
  return new mongoose.Types.ObjectId().toHexString();
}
