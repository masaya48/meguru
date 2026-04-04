import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/modules/prisma/prisma.service";

describe("Auth (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.tenant.deleteMany({ where: { slug: "test-cho" } });
    await prisma.$disconnect();
    await app.close();
  });

  let tenantId: string;
  let accessToken: string;

  it("POST /tenants — creates a tenant", async () => {
    const res = await request(app.getHttpServer())
      .post("/tenants")
      .send({ name: "テスト町内会", slug: "test-cho" })
      .expect(201);

    tenantId = res.body.id;
    expect(res.body.name).toBe("テスト町内会");
    expect(res.body.slug).toBe("test-cho");
  });

  it("POST /auth/register — registers admin with password", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        tenantId,
        name: "管理者テスト",
        email: "admin@test-cho.example.com",
        password: "password123",
        role: "ADMIN",
      })
      .expect(201);

    accessToken = res.body.accessToken;
    expect(accessToken).toBeDefined();
    expect(res.body.user.role).toBe("ADMIN");
  });

  it("POST /auth/login — logs in with password", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "admin@test-cho.example.com",
        password: "password123",
      })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
  });

  it("GET /users — returns users (authenticated)", async () => {
    const res = await request(app.getHttpServer())
      .get("/users")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("管理者テスト");
  });

  it("GET /users — rejects without token", async () => {
    await request(app.getHttpServer()).get("/users").expect(401);
  });

  it("POST /groups — creates a group (admin)", async () => {
    const res = await request(app.getHttpServer())
      .post("/groups")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "1班", sortOrder: 1 })
      .expect(201);

    expect(res.body.name).toBe("1班");
  });
});
