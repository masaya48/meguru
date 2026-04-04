GitHub Issue をトリアージし、ラベル・優先度・見積もりを付与する。

引数: Issue番号 (例: `/triage-issue 42`)

## 手順

1. `gh issue view $ARGUMENTS --json title,body,labels` で Issue を取得
2. 内容を分析し、以下を判定:
   - **カテゴリラベル**: `api`, `web`, `db`, `auth`, `line`, `tenant`, `infra`, `docs`
   - **種別ラベル**: `bug`, `feature`, `enhancement`, `tech-debt`, `question`
   - **優先度ラベル**: `priority:high`, `priority:medium`, `priority:low`
   - **サイズ**: `size:xs`(~1h), `size:s`(~半日), `size:m`(~1日), `size:l`(~数日)
3. 不足しているラベルを `gh issue edit $ARGUMENTS --add-label` で付与
4. サイズが `size:l` 以上なら、サブタスクへの分割を提案
5. 判断結果を報告
