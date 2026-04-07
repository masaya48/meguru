import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { AiService } from "./ai.service";

jest.mock("@anthropic-ai/sdk", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [{ type: "text", text: "Generated report text" }],
        }),
      },
    })),
  };
});

describe("AiService", () => {
  let service: AiService;
  let mockCreate: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue("test-api-key"),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    // Access the mock create function via the client instance
    const Anthropic = require("@anthropic-ai/sdk").default;
    const instance = Anthropic.mock.results[Anthropic.mock.results.length - 1].value;
    mockCreate = instance.messages.create;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("generateLessonReport", () => {
    it("should call the API with correct params and return text", async () => {
      const params = {
        teacherMemo: "今日はドレミの練習をしました。",
        studentName: "田中花子",
        courseName: "ピアノ初級",
        genre: "ピアノ",
      };

      const result = await service.generateLessonReport(params);

      expect(result).toBe("Generated report text");
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: expect.stringContaining("ピアノ"),
          messages: [
            expect.objectContaining({
              role: "user",
              content: expect.stringContaining("田中花子"),
            }),
          ],
        }),
      );
    });

    it("should re-throw errors on API failure", async () => {
      const apiError = new Error("API Error");
      mockCreate.mockRejectedValueOnce(apiError);

      const params = {
        teacherMemo: "メモ",
        studentName: "生徒",
        courseName: "コース",
        genre: "ピアノ",
      };

      await expect(service.generateLessonReport(params)).rejects.toThrow("API Error");
    });
  });

  describe("generateMonthlySummary", () => {
    it("should call the API with correct params and return text", async () => {
      const params = {
        studentName: "山田太郎",
        courseName: "英会話中級",
        genre: "英会話",
        year: 2024,
        month: 3,
        attendanceStats: { total: 4, present: 3, absent: 1, late: 0 },
        lessonMemos: ["発音の練習", "文法の復習", "会話練習"],
      };

      const result = await service.generateMonthlySummary(params);

      expect(result).toBe("Generated report text");
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1500,
          system: expect.stringContaining("英会話"),
          messages: [
            expect.objectContaining({
              role: "user",
              content: expect.stringContaining("山田太郎"),
            }),
          ],
        }),
      );
    });

    it("should include attendance stats and lesson memos in the message", async () => {
      const params = {
        studentName: "鈴木一郎",
        courseName: "バイオリン",
        genre: "バイオリン",
        year: 2024,
        month: 4,
        attendanceStats: { total: 5, present: 4, absent: 0, late: 1 },
        lessonMemos: ["弓の持ち方", "音階練習", "曲の練習"],
      };

      await service.generateMonthlySummary(params);

      const callArgs = mockCreate.mock.calls[0][0];
      const userMessage = callArgs.messages[0].content;
      expect(userMessage).toContain("2024年4月");
      expect(userMessage).toContain("5回中4回出席");
      expect(userMessage).toContain("1回目: 弓の持ち方");
    });

    it("should re-throw errors on API failure", async () => {
      const apiError = new Error("Network Error");
      mockCreate.mockRejectedValueOnce(apiError);

      const params = {
        studentName: "生徒",
        courseName: "コース",
        genre: "ジャンル",
        year: 2024,
        month: 1,
        attendanceStats: { total: 1, present: 1, absent: 0, late: 0 },
        lessonMemos: ["メモ"],
      };

      await expect(service.generateMonthlySummary(params)).rejects.toThrow("Network Error");
    });
  });
});
