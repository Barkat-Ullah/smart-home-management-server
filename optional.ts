// async createRoom(userId: string, dto: CreateRoomDto) {
//   const count = await prisma.room.count({
//     where: { userId, isDeleted: false }
//   })

//   if (count >= 8) {
//     throw new BadRequestException("Maximum 8 rooms allowed")
//   }

//   return prisma.room.create({ data: { ...dto, userId } })
// }

// const DEFAULT_ROOMS = [
//   { name: "Living Room", type: "LivingRoom", isDefault: true },
//   { name: "Kitchen",     type: "Kitchen",    isDefault: true },
//   { name: "Bathroom",    type: "Bathroom",   isDefault: true },
//   { name: "Bedroom",     type: "Bedroom",    isDefault: true },
//   { name: "Backyard",    type: "Backyard",   isDefault: true },
//   { name: "Terrace",     type: "Terrace",    isDefault: true },
// ]

// // on user register:
// await prisma.room.createMany({
//   data: DEFAULT_ROOMS.map(room => ({ ...room, userId: newUser.id }))
// })