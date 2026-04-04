import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/modules/prisma/prisma.service";

describe("Circular flow (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let memberToken: string;
  let tenantId: string;
  let circularId: string;
  let questionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);

    // Setup: create tenant + admin + member
    const tenantRes = await request(app.getHttpServer())
      .post("/tenants")
      .send({ name: "テスト町内会Phase2", slug: "test-phase2" });
    tenantId = tenantRes.body.id;

    const adminRes = await request(app.getHttpServer()).post("/auth/register").send({
      tenantId,
      name: "管理者",
      email: "admin@phase2.test",
      password: "password123",
      role: "ADMIN",
    });
    adminToken = adminRes.body.accessToken;

    const memberRes = await request(app.getHttpServer()).post("/auth/register").send({
      tenantId,
      name: "住民",
      email: "member@phase2.test",
    });
    memberToken = memberRes.body.accessToken;
  });

  afterAll(async () => {
    await prisma.tenant.deleteMany({ where: { slug: "test-phase2" } });
    await prisma.$disconnect();
    await app.close();
  });

  it("POST /circulars — admin creates a circular with question", async () => {
    const res = await request(app.getHttpServer())
      .post("/circulars")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "春の清掃",
        body: "清掃のお知らせです",
        type: "ATTENDANCE",
        questions: [
          {
            questionText: "参加できますか？",
            type: "YES_NO",
            options: ["参加する", "不参加"],
          },
        ],
      })
      .expect(201);

    circularId = res.body.id;
    questionId = res.body.questions[0].id;
    expect(res.body.status).toBe("DRAFT");
    expect(res.body.questions).toHaveLength(1);
  });

  it("POST /circulars — member cannot create", async () => {
    await request(app.getHttpServer())
      .post("/circulars")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ title: "Test", body: "Test", type: "NOTICE" })
      .expect(403);
  });

  it("POST /circulars/:id/publish — admin publishes", async () => {
    const res = await request(app.getHttpServer())
      .post(`/circulars/${circularId}/publish`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(201);

    expect(res.body.status).toBe("PUBLISHED");
  });

  it("GET /circulars — member sees published circulars", async () => {
    const res = await request(app.getHttpServer())
      .get("/circulars")
      .set("Authorization", `Bearer ${memberToken}`)
      .expect(200);

    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body.every((c: any) => c.status === "PUBLISHED")).toBe(true);
  });

  it("POST /circulars/:id/reads — member marks as read", async () => {
    const res = await request(app.getHttpServer())
      .post(`/circulars/${circularId}/reads`)
      .set("Authorization", `Bearer ${memberToken}`)
      .expect(201);

    expect(res.body.circularId).toBe(circularId);
  });

  it("POST /circulars/:id/answers — member submits answer", async () => {
    const res = await request(app.getHttpServer())
      .post(`/circulars/${circularId}/answers`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ questionId, answer: "参加する" })
      .expect(201);

    expect(res.body.answer).toBe("参加する");
  });

  it("GET /circulars/:id/answers/mine — member sees own answers", async () => {
    const res = await request(app.getHttpServer())
      .get(`/circulars/${circularId}/answers/mine`)
      .set("Authorization", `Bearer ${memberToken}`)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].answer).toBe("参加する");
  });

  it("GET /circulars/:id/stats — admin sees stats", async () => {
    const res = await request(app.getHttpServer())
      .get(`/circulars/${circularId}/stats`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.readCount).toBeGreaterThanOrEqual(1);
    expect(res.body.questions[0].answerCount).toBeGreaterThanOrEqual(1);
  });

  it("POST /circulars/:id/close — admin closes circular", async () => {
    const res = await request(app.getHttpServer())
      .post(`/circulars/${circularId}/close`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(201);

    expect(res.body.status).toBe("CLOSED");
  });

  it("POST /templates — admin creates template", async () => {
    const res = await request(app.getHttpServer())
      .post("/templates")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "出欠確認テンプレ",
        bodyTemplate: "{{event}}の出欠を確認します",
        type: "ATTENDANCE",
        questions: [{ questionText: "参加できますか？", type: "YES_NO" }],
      })
      .expect(201);

    expect(res.body.name).toBe("出欠確認テンプレ");
  });

  it("GET /templates — admin lists templates", async () => {
    const res = await request(app.getHttpServer())
      .get("/templates")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});
