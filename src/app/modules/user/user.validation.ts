import { z } from 'zod';
import { UserRoleEnum, UserStatus, Gender, PLanType } from '@prisma/client';

const createSchema = z.object({
  fullName: z.string({
    required_error: 'fullName is required',
    invalid_type_error: 'Invalid fullName',
  }),
  email: z.string({
    required_error: 'email is required',
    invalid_type_error: 'Invalid email',
  }),
  phoneNumber: z
    .string({
      required_error: 'phoneNumber is required',
      invalid_type_error: 'Invalid phoneNumber',
    })
    .optional(),
  password: z.string({
    required_error: 'password is required',
    invalid_type_error: 'Invalid password',
  }),
  role: z.enum(
    [UserRoleEnum.MODERATOR, UserRoleEnum.CAREGIVER, UserRoleEnum.FAMILYMEMBER],
    { required_error: 'Role is required' },
  ),
  status: z
    .nativeEnum(UserStatus, {
      required_error: 'status is required',
      invalid_type_error: 'Invalid status',
    })
    .optional(),
  describe: z
    .string({
      required_error: 'describe is required',
      invalid_type_error: 'Invalid describe',
    })
    .optional(),
  city: z
    .string({
      required_error: 'city is required',
      invalid_type_error: 'Invalid city',
    })
    .optional(),
  address: z
    .string({
      required_error: 'address is required',
      invalid_type_error: 'Invalid address',
    })
    .optional(),
  image: z
    .string({
      required_error: 'image is required',
      invalid_type_error: 'Invalid image',
    })
    .optional(),
  bloodGroup: z
    .string({
      required_error: 'bloodGroup is required',
      invalid_type_error: 'Invalid bloodGroup',
    })
    .optional(),
  gender: z
    .nativeEnum(Gender, {
      required_error: 'gender is required',
      invalid_type_error: 'Invalid gender',
    })
    .optional(),
  allergies: z
    .array(
      z.string({
        required_error: 'allergies is required',
        invalid_type_error: 'Invalid allergies',
      }),
      {
        required_error: 'allergies is required',
        invalid_type_error: 'Invalid allergies',
      },
    )
    .optional(),
  isAgreeWithTerms: z
    .boolean({
      required_error: 'isAgreeWithTerms is required',
      invalid_type_error: 'Invalid isAgreeWithTerms',
    })
    .optional(),
  plan: z
    .nativeEnum(PLanType, {
      required_error: 'plan is required',
      invalid_type_error: 'Invalid plan',
    })
    .optional(),
  otp: z
    .string({
      required_error: 'otp is required',
      invalid_type_error: 'Invalid otp',
    })
    .optional(),
  otpExpiry: z.coerce
    .date({
      required_error: 'otpExpiry is required',
      invalid_type_error: 'Invalid otpExpiry',
    })
    .optional(),
  emailVerificationToken: z
    .string({
      required_error: 'emailVerificationToken is required',
      invalid_type_error: 'Invalid emailVerificationToken',
    })
    .optional(),
  emailVerificationTokenExpires: z
    .string({
      required_error: 'emailVerificationTokenExpires is required',
      invalid_type_error: 'Invalid emailVerificationTokenExpires',
    })
    .optional(),
  isEmailVerified: z
    .boolean({
      required_error: 'isEmailVerified is required',
      invalid_type_error: 'Invalid isEmailVerified',
    })
    .optional(),
  isDeleted: z
    .boolean({
      required_error: 'isDeleted is required',
      invalid_type_error: 'Invalid isDeleted',
    })
    .optional(),
  stripeCustomerId: z
    .string({
      required_error: 'stripeCustomerId is required',
      invalid_type_error: 'Invalid stripeCustomerId',
    })
    .optional(),
  fcmToken: z
    .string({
      required_error: 'fcmToken is required',
      invalid_type_error: 'Invalid fcmToken',
    })
    .optional(),
  isOnline: z
    .boolean({
      required_error: 'isOnline is required',
      invalid_type_error: 'Invalid isOnline',
    })
    .optional(),
  lastLoginAt: z.coerce
    .date({
      required_error: 'lastLoginAt is required',
      invalid_type_error: 'Invalid lastLoginAt',
    })
    .optional(),
  createdById: z
    .string({
      required_error: 'createdById is required',
      invalid_type_error: 'Invalid createdById',
    })
    .optional(), // ← NEW
});

const updateSchema = z.object({
  fullName: z.string({ required_error: 'fullName is required', invalid_type_error: 'Invalid fullName' }).optional(),
  email: z.string({ required_error: 'email is required', invalid_type_error: 'Invalid email' }).optional(),
  phoneNumber: z.string({ required_error: 'phoneNumber is required', invalid_type_error: 'Invalid phoneNumber' }).optional(),
  password: z.string({ required_error: 'password is required', invalid_type_error: 'Invalid password' }).optional(),
  role: z.nativeEnum(UserRoleEnum, { required_error: 'role is required', invalid_type_error: 'Invalid role' }).optional(),
  status: z.nativeEnum(UserStatus, { required_error: 'status is required', invalid_type_error: 'Invalid status' }).optional(),
  describe: z.string({ required_error: 'describe is required', invalid_type_error: 'Invalid describe' }).optional(),
  city: z.string({ required_error: 'city is required', invalid_type_error: 'Invalid city' }).optional(),
  address: z.string({ required_error: 'address is required', invalid_type_error: 'Invalid address' }).optional(),
  image: z.string({ required_error: 'image is required', invalid_type_error: 'Invalid image' }).optional(),
  bloodGroup: z.string({ required_error: 'bloodGroup is required', invalid_type_error: 'Invalid bloodGroup' }).optional(),
  gender: z.nativeEnum(Gender, { required_error: 'gender is required', invalid_type_error: 'Invalid gender' }).optional(),
  allergies: z.array(z.string({ required_error: 'allergies is required', invalid_type_error: 'Invalid allergies' }), { required_error: 'allergies is required', invalid_type_error: 'Invalid allergies' }).optional(),
  isAgreeWithTerms: z.boolean({ required_error: 'isAgreeWithTerms is required', invalid_type_error: 'Invalid isAgreeWithTerms' }).optional(),
  plan: z.nativeEnum(PLanType, { required_error: 'plan is required', invalid_type_error: 'Invalid plan' }).optional(),
  otp: z.string({ required_error: 'otp is required', invalid_type_error: 'Invalid otp' }).optional(),
  otpExpiry: z.coerce.date({ required_error: 'otpExpiry is required', invalid_type_error: 'Invalid otpExpiry' }).optional(),
  emailVerificationToken: z.string({ required_error: 'emailVerificationToken is required', invalid_type_error: 'Invalid emailVerificationToken' }).optional(),
  emailVerificationTokenExpires: z.string({ required_error: 'emailVerificationTokenExpires is required', invalid_type_error: 'Invalid emailVerificationTokenExpires' }).optional(),
  isEmailVerified: z.boolean({ required_error: 'isEmailVerified is required', invalid_type_error: 'Invalid isEmailVerified' }).optional(),
  isDeleted: z.boolean({ required_error: 'isDeleted is required', invalid_type_error: 'Invalid isDeleted' }).optional(),
  stripeCustomerId: z.string({ required_error: 'stripeCustomerId is required', invalid_type_error: 'Invalid stripeCustomerId' }).optional(),
  fcmToken: z.string({ required_error: 'fcmToken is required', invalid_type_error: 'Invalid fcmToken' }).optional(),
  isOnline: z.boolean({ required_error: 'isOnline is required', invalid_type_error: 'Invalid isOnline' }).optional(),
  lastLoginAt: z.coerce.date({ required_error: 'lastLoginAt is required', invalid_type_error: 'Invalid lastLoginAt' }).optional(),
});

export const userValidation = {
  createSchema,
  updateSchema,
};