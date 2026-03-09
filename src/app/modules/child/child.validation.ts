import { z } from 'zod';
import { Gender } from '@prisma/client';

const createSchema = z.object({
  fullName: z.string({ required_error: 'fullName is required', invalid_type_error: 'Invalid fullName' }),
  preferredName: z.string({ required_error: 'preferredName is required', invalid_type_error: 'Invalid preferredName' }).optional(),
  dateOfBirth: z.coerce.date({ required_error: 'dateOfBirth is required', invalid_type_error: 'Invalid dateOfBirth' }).optional(),
  gender: z.nativeEnum(Gender, { required_error: 'gender is required', invalid_type_error: 'Invalid gender' }).optional(),
  bloodGroup: z.string({ required_error: 'bloodGroup is required', invalid_type_error: 'Invalid bloodGroup' }).optional(),
  favoriteFood: z.array(z.string({ required_error: 'favoriteFood is required', invalid_type_error: 'Invalid favoriteFood' }), { required_error: 'favoriteFood is required', invalid_type_error: 'Invalid favoriteFood' }).optional(),
  allergies: z.array(z.string({ required_error: 'allergies is required', invalid_type_error: 'Invalid allergies' }), { required_error: 'allergies is required', invalid_type_error: 'Invalid allergies' }).optional(),
  medicalConditions: z.array(z.string({ required_error: 'medicalConditions is required', invalid_type_error: 'Invalid medicalConditions' }), { required_error: 'medicalConditions is required', invalid_type_error: 'Invalid medicalConditions' }).optional(),
  heightCm: z.number({ required_error: 'heightCm is required', invalid_type_error: 'Invalid heightCm' }).optional(),
  weightKg: z.number({ required_error: 'weightKg is required', invalid_type_error: 'Invalid weightKg' }).optional(),
  lastCheckupDate: z.coerce.date({ required_error: 'lastCheckupDate is required', invalid_type_error: 'Invalid lastCheckupDate' }).optional(),
  emergencyContact: z.string({ required_error: 'emergencyContact is required', invalid_type_error: 'Invalid emergencyContact' }).optional(),
  files: z.string({ required_error: 'files is required', invalid_type_error: 'Invalid files' }).optional(),
  about: z.string({ required_error: 'about is required', invalid_type_error: 'Invalid about' }).optional(),
  schoolName: z.string({ required_error: 'schoolName is required', invalid_type_error: 'Invalid schoolName' }).optional(),
  classGrade: z.string({ required_error: 'classGrade is required', invalid_type_error: 'Invalid classGrade' }).optional(),
  interests: z.array(z.string({ required_error: 'interests is required', invalid_type_error: 'Invalid interests' }), { required_error: 'interests is required', invalid_type_error: 'Invalid interests' }).optional(),
  isActive: z.boolean({ required_error: 'isActive is required', invalid_type_error: 'Invalid isActive' }).optional(),
  isDeleted: z.boolean({ required_error: 'isDeleted is required', invalid_type_error: 'Invalid isDeleted' }).optional(),
});

const updateSchema = z.object({
  fullName: z.string({ required_error: 'fullName is required', invalid_type_error: 'Invalid fullName' }).optional(),
  preferredName: z.string({ required_error: 'preferredName is required', invalid_type_error: 'Invalid preferredName' }).optional(),
  dateOfBirth: z.coerce.date({ required_error: 'dateOfBirth is required', invalid_type_error: 'Invalid dateOfBirth' }).optional(),
  gender: z.nativeEnum(Gender, { required_error: 'gender is required', invalid_type_error: 'Invalid gender' }).optional(),
  bloodGroup: z.string({ required_error: 'bloodGroup is required', invalid_type_error: 'Invalid bloodGroup' }).optional(),
  favoriteFood: z.array(z.string({ required_error: 'favoriteFood is required', invalid_type_error: 'Invalid favoriteFood' }), { required_error: 'favoriteFood is required', invalid_type_error: 'Invalid favoriteFood' }).optional(),
  allergies: z.array(z.string({ required_error: 'allergies is required', invalid_type_error: 'Invalid allergies' }), { required_error: 'allergies is required', invalid_type_error: 'Invalid allergies' }).optional(),
  medicalConditions: z.array(z.string({ required_error: 'medicalConditions is required', invalid_type_error: 'Invalid medicalConditions' }), { required_error: 'medicalConditions is required', invalid_type_error: 'Invalid medicalConditions' }).optional(),
  heightCm: z.number({ required_error: 'heightCm is required', invalid_type_error: 'Invalid heightCm' }).optional(),
  weightKg: z.number({ required_error: 'weightKg is required', invalid_type_error: 'Invalid weightKg' }).optional(),
  lastCheckupDate: z.coerce.date({ required_error: 'lastCheckupDate is required', invalid_type_error: 'Invalid lastCheckupDate' }).optional(),
  emergencyContact: z.string({ required_error: 'emergencyContact is required', invalid_type_error: 'Invalid emergencyContact' }).optional(),
  files: z.string({ required_error: 'files is required', invalid_type_error: 'Invalid files' }).optional(),
  about: z.string({ required_error: 'about is required', invalid_type_error: 'Invalid about' }).optional(),
  schoolName: z.string({ required_error: 'schoolName is required', invalid_type_error: 'Invalid schoolName' }).optional(),
  classGrade: z.string({ required_error: 'classGrade is required', invalid_type_error: 'Invalid classGrade' }).optional(),
  interests: z.array(z.string({ required_error: 'interests is required', invalid_type_error: 'Invalid interests' }), { required_error: 'interests is required', invalid_type_error: 'Invalid interests' }).optional(),
  isActive: z.boolean({ required_error: 'isActive is required', invalid_type_error: 'Invalid isActive' }).optional(),
  isDeleted: z.boolean({ required_error: 'isDeleted is required', invalid_type_error: 'Invalid isDeleted' }).optional(),
});

export const childValidation = {
  createSchema,
  updateSchema,
};