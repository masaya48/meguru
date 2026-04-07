import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Anthropic from "@anthropic-ai/sdk";

@Injectable()
export class AiService {
  private readonly client: Anthropic;
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.getOrThrow("ANTHROPIC_API_KEY"),
    });
  }

  async generateLessonReport(params: {
    teacherMemo: string;
    studentName: string;
    courseName: string;
    genre: string;
  }): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: `あなたは${params.genre}教室の先生のアシスタントです。先生が書いたレッスンメモを、保護者向けの温かく丁寧なレポートに変換してください。
ルール:
- 200〜400字
- 前向きなトーン。具体的な改善ポイントも含む
- 絵文字は1〜2個まで
- 生徒の名前を含める
- 挨拶文は不要。レッスン内容から始める`,
        messages: [
          {
            role: "user",
            content: `生徒: ${params.studentName}\nコース: ${params.courseName}\n\n先生のメモ:\n${params.teacherMemo}`,
          },
        ],
      });

      const text = response.content[0];
      if (text.type !== "text") throw new Error("Unexpected response type");
      return text.text;
    } catch (error) {
      this.logger.error("Failed to generate lesson report", error);
      throw error;
    }
  }

  async generateMonthlySummary(params: {
    studentName: string;
    courseName: string;
    genre: string;
    year: number;
    month: number;
    attendanceStats: { total: number; present: number; absent: number; late: number };
    lessonMemos: string[];
  }): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        system: `あなたは${params.genre}教室の先生のアシスタントです。1ヶ月分のレッスンメモと出席データから、保護者向けの月次サマリーを作成してください。
ルール:
- 300〜600字
- 出席データは事実として記載
- メモから進捗を要約
- 来月の目標を1〜2つ提案
- 温かく前向きなトーン`,
        messages: [
          {
            role: "user",
            content: `生徒: ${params.studentName}
コース: ${params.courseName}
期間: ${params.year}年${params.month}月

出席: ${params.attendanceStats.total}回中${params.attendanceStats.present}回出席（遅刻${params.attendanceStats.late}回、欠席${params.attendanceStats.absent}回）

各回のメモ:
${params.lessonMemos.map((m, i) => `${i + 1}回目: ${m}`).join("\n")}`,
          },
        ],
      });

      const text = response.content[0];
      if (text.type !== "text") throw new Error("Unexpected response type");
      return text.text;
    } catch (error) {
      this.logger.error("Failed to generate monthly summary", error);
      throw error;
    }
  }
}
