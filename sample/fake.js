import { faker } from '@faker-js/faker';
import { PrismaClient } from './node_modules/@prisma/client.js';
const client = new PrismaClient()

const METRICS = ['Page Views', 'Signups', 'Revenue', 'Bounce Rate', 'API Latency', 'Orders'];
const SOURCES = ['Homepage', 'Landing Page', 'Dashboard', 'Mobile App', 'API Gateway'];
async function seedAnalytics(count = 100) {
    for (let i = 0; i < count; i++) {
        const metric = faker.helpers.arrayElement(METRICS);
        const value = parseFloat(faker.number.float({ min: 0, max: 1000, precision: 0.01 }).toFixed(2));
        const recordedAt = faker.date.between({
            from: '2024-01-01T00:00:00.000Z',
            to: '2025-07-01T00:00:00.000Z',
        });
        const source = faker.helpers.arrayElement(SOURCES);
        const categoryId = faker.number.int({ min: 1, max: 5 }); // Assuming you have 5 categories

        const analytic = await client.analytics.create({
            data: {
                metric,
                value,
                recordedAt,
                source,
                categoryId,
            },
        })
        console.log(analytic)
    }
    console.log(`✅ Inserted ${count} analytics records.`);
}
async function fakeData() {
    for (let i = 0; i < 100; i++) {
        const email = faker.internet.email()
        const name = faker.person.fullName()
        const bio = faker.person.bio()
        const birth = faker.date.birthdate()
        const categoryName = faker.book.genre()
        const tag = faker.color.human()
         const recordedAt = faker.date.between({
            from: '2024-01-01T00:00:00.000Z',
            to: '2025-07-01T00:00:00.000Z',
        });
        const user = await client.user.create({
            data: {
                email: email,
                name: name,
                profile: { create: { bio: bio, age: birth } },
                posts: {
                    create:
                    {
                        title: faker.book.title(),
                        createdAt:recordedAt,
                        category: { connectOrCreate: { where: { name: categoryName }, create: { name: categoryName } } },
                        content: faker.lorem.text(),
                        tags: { connectOrCreate: { where: { name: tag }, create: { name: tag } } },
                    }
                }
            }, include: { posts: { include: { tags: true } }, comments: true, profile: true }
        })
        console.log(user)
    }

}
await fakeData()
await seedAnalytics()