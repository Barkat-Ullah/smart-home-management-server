import { z } from 'zod';
import { FamilyRelation, Gender, FamilyMemberStatus } from '@prisma/client';

const createSchema = z.object({
  fullName: z.string({ required_error: 'fullName is required', invalid_type_error: 'Invalid fullName' }),
  relation: z.nativeEnum(FamilyRelation, { required_error: 'relation is required', invalid_type_error: 'Invalid relation' }),
  gender: z.nativeEnum(Gender, { required_error: 'gender is required', invalid_type_error: 'Invalid gender' }),
  dateOfBirth: z.coerce.date({ required_error: 'dateOfBirth is required', invalid_type_error: 'Invalid dateOfBirth' }).optional(),
  occupation: z.string({ required_error: 'occupation is required', invalid_type_error: 'Invalid occupation' }).optional(),
  phone: z.string({ required_error: 'phone is required', invalid_type_error: 'Invalid phone' }).optional(),
  email: z.string({ required_error: 'email is required', invalid_type_error: 'Invalid email' }).optional(),
  image: z.string({ required_error: 'image is required', invalid_type_error: 'Invalid image' }).optional(),
  address: z.string({ required_error: 'address is required', invalid_type_error: 'Invalid address' }).optional(),
  city: z.string({ required_error: 'city is required', invalid_type_error: 'Invalid city' }).optional(),
  country: z.string({ required_error: 'country is required', invalid_type_error: 'Invalid country' }).optional(),
  about: z.string({ required_error: 'about is required', invalid_type_error: 'Invalid about' }).optional(),
  status: z.nativeEnum(FamilyMemberStatus, { required_error: 'status is required', invalid_type_error: 'Invalid status' }).optional(),
  isDeleted: z.boolean({ required_error: 'isDeleted is required', invalid_type_error: 'Invalid isDeleted' }).optional(),
});

const updateSchema = z.object({
  fullName: z.string({ required_error: 'fullName is required', invalid_type_error: 'Invalid fullName' }).optional(),
  relation: z.nativeEnum(FamilyRelation, { required_error: 'relation is required', invalid_type_error: 'Invalid relation' }).optional(),
  gender: z.nativeEnum(Gender, { required_error: 'gender is required', invalid_type_error: 'Invalid gender' }).optional(),
  dateOfBirth: z.coerce.date({ required_error: 'dateOfBirth is required', invalid_type_error: 'Invalid dateOfBirth' }).optional(),
  occupation: z.string({ required_error: 'occupation is required', invalid_type_error: 'Invalid occupation' }).optional(),
  phone: z.string({ required_error: 'phone is required', invalid_type_error: 'Invalid phone' }).optional(),
  email: z.string({ required_error: 'email is required', invalid_type_error: 'Invalid email' }).optional(),
  image: z.string({ required_error: 'image is required', invalid_type_error: 'Invalid image' }).optional(),
  address: z.string({ required_error: 'address is required', invalid_type_error: 'Invalid address' }).optional(),
  city: z.string({ required_error: 'city is required', invalid_type_error: 'Invalid city' }).optional(),
  country: z.string({ required_error: 'country is required', invalid_type_error: 'Invalid country' }).optional(),
  about: z.string({ required_error: 'about is required', invalid_type_error: 'Invalid about' }).optional(),
  status: z.nativeEnum(FamilyMemberStatus, { required_error: 'status is required', invalid_type_error: 'Invalid status' }).optional(),
  isDeleted: z.boolean({ required_error: 'isDeleted is required', invalid_type_error: 'Invalid isDeleted' }).optional(),
});

export const familyMemberValidation = {
  createSchema,
  updateSchema,
};