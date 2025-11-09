import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const username = process.env.CHAIRMAN_USERNAME || 'chairman'
  const password = process.env.CHAIRMAN_PASSWORD || 'admin123'
  const name = process.env.CHAIRMAN_NAME || 'Chairman'
  const email = process.env.CHAIRMAN_EMAIL || 'chairman@bhavki.com'
  const mobile = process.env.CHAIRMAN_MOBILE || '01700000000'

  const existingChairman = await prisma.user.findFirst({
    where: { role: 'chairman' },
  })

  if (existingChairman) {
    console.log('Chairman account already exists')
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const chairman = await prisma.user.create({
    data: {
      membershipId: username,
      name,
      fatherName: 'N/A',
      mobile,
      passwordHash,
      role: 'chairman',
    },
  })

  console.log('Chairman account created successfully!')
  console.log('Username:', username)
  console.log('Password:', password)
  console.log('Email:', email)
  console.log('\n⚠️  IMPORTANT: Change the default password after first login!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
