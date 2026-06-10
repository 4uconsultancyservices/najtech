import { Schema } from 'mongoose';
import { getModel } from '../utils';

const SettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: Schema.Types.Mixed,
    group: { type: String, required: true },
  },
  { timestamps: true }
);

export const Settings = getModel('Settings', SettingsSchema);
