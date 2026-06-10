import { Schema } from 'mongoose';
import { getModel } from '../utils';

const ThemeSchema = new Schema(
  {
    siteName: { type: String, default: 'NajTech' },
    logo: String,
    favicon: String,
    primaryColor: { type: String, default: '#6366f1' },
    secondaryColor: { type: String, default: '#8b5cf6' },
    accentColor: { type: String, default: '#06b6d4' },
    fontFamily: { type: String, default: 'Plus Jakarta Sans' },
    fontSize: { type: String, enum: ['sm', 'md', 'lg'], default: 'md' },
    borderRadius: { type: String, enum: ['none', 'sm', 'md', 'lg', 'full'], default: 'md' },
    darkMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Theme = getModel('Theme', ThemeSchema);
