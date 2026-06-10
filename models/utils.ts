import mongoose, { Schema, Model } from 'mongoose';

export function getModel<T>(name: string, schema: Schema): Model<T> {
  return (mongoose.models[name] || mongoose.model<T>(name, schema)) as Model<T>;
}
