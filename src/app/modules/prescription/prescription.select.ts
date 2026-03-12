import { Prisma } from '@prisma/client';

export const prescriptionSelect = {
  id: true,
  userId: true,
  memberId: true,
  childId: true,
  title: true,
  doctorName: true,
  hospitalName: true,
  notes: true,
  files: true,
  createdAt: true,
  updatedAt: true,
  // Uncomment to include nested medicines list
  // medicines: {
  //   where: { isDeleted: false },
  //   select: {
  //     id: true,
  //     medicineName: true,
  //     medicineForm: true,
  //     status: true,
  //   },
  // },
} satisfies Prisma.PrescriptionSelect;

export const prescriptionWithMedicinesSelect = {
  id: true,
  userId: true,
  memberId: true,
  childId: true,
  title: true,
  doctorName: true,
  hospitalName: true,
  notes: true,
  files: true,
  createdAt: true,
  updatedAt: true,
  medicines: {
    where: { isDeleted: false },
    select: {
      id: true,
      medicineName: true,
      medicineForm: true,
      doseAmount: true,
      doseUnit: true,
      frequencyType: true,
      scheduledTimes: true,
      mealTiming: true,
      startDate: true,
      endDate: true,
      status: true,
    },
  },
} satisfies Prisma.PrescriptionSelect;
