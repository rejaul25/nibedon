import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

const prisma = new PrismaClient()

const generateMembershipId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = crypto.randomBytes(2).toString('hex').toUpperCase()
  return `BM-${timestamp}-${random}`
}

async function main() {
  const chairman = await prisma.user.findFirst({
    where: { role: 'chairman' },
  })

  if (!chairman) {
    console.error('Chairman account not found. Run seed:init first.')
    return
  }

  const passwordHash = await bcrypt.hash('password123', 10)

  const sampleMembers = [
    { name: 'আব্দুল করিম', fatherName: 'মোহাম্মদ আলী', mobile: '01711111111', shareType: 'fullShare' },
    { name: 'রহিম উদ্দিন', fatherName: 'করিম উদ্দিন', mobile: '01722222222', shareType: 'fullShare' },
    { name: 'সালমা খাতুন', fatherName: 'আব্দুল জব্বার', mobile: '01733333333', shareType: 'newMember' },
    { name: 'মোহাম্মদ জসিম', fatherName: 'আব্দুর রহমান', mobile: '01744444444', shareType: 'fullShare' },
    { name: 'ফাতেমা বেগম', fatherName: 'মোহাম্মদ আলী', mobile: '01755555555', shareType: 'newMember' },
  ]

  for (const member of sampleMembers) {
    const membershipId = generateMembershipId()
    
    await prisma.membershipId.create({
      data: { membershipId },
    })

    const user = await prisma.user.create({
      data: {
        membershipId,
        name: member.name,
        fatherName: member.fatherName,
        mobile: member.mobile,
        passwordHash,
        role: 'member',
        shareType: member.shareType as any,
      },
    })

    await prisma.membershipId.update({
      where: { membershipId },
      data: { assignedTo: user.id },
    })

    const paymentCount = Math.floor(Math.random() * 6) + 3
    for (let i = 0; i < paymentCount; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - (paymentCount - i))
      
      await prisma.payment.create({
        data: {
          membershipId,
          amount: 500,
          date,
          paymentFrom: ['bKash', 'Nagad', 'Bank'][Math.floor(Math.random() * 3)] as any,
          transactionNumber: Math.random() > 0.3 ? `TXN${Math.random().toString(36).substring(7).toUpperCase()}` : null,
          createdById: chairman.id,
        },
      })
    }
  }

  await prisma.investment.create({
    data: {
      title: 'অফিস সরঞ্জাম ক্রয়',
      description: 'নতুন অফিস কম্পিউটার এবং প্রিন্টার ক্রয়',
      amount: 50000,
      date: new Date(),
      purpose: 'অফিস উন্নয়ন',
      createdBy: chairman.id,
    },
  })

  await prisma.investment.create({
    data: {
      title: 'প্রশিক্ষণ কর্মসূচি',
      description: 'সদস্যদের জন্য দক্ষতা উন্নয়ন প্রশিক্ষণ',
      amount: 30000,
      date: new Date(),
      purpose: 'সদস্য উন্নয়ন',
      createdBy: chairman.id,
    },
  })

  console.log('Sample data created successfully!')
  console.log(`Created ${sampleMembers.length} members with payments`)
  console.log('Created 2 investments')
  console.log('\nAll members have password: password123')
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
