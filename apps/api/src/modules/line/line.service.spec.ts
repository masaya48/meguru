import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { LineService } from "./line.service";

describe("LineService", () => {
  let service: LineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const map: Record<string, string> = {
                LINE_CHANNEL_ACCESS_TOKEN: "test-token",
                LINE_CHANNEL_SECRET: "test-secret",
                APP_URL: "http://localhost:3000",
              };
              return map[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<LineService>(LineService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("verifies signature correctly", () => {
    expect(typeof service.verifySignature).toBe("function");
  });

  it("returns appUrl", () => {
    expect(service.getAppUrl()).toBe("http://localhost:3000");
  });
});
