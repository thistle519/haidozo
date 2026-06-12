/**
 * フェーズ2 Embedding / ベクトル検索スケルトン
 *
 * 実装計画（フェーズ2）:
 *  - 0004_pgvector.sql で pgvector 拡張を追加し、posts テーブルに
 *    embedding vector(1536) カラムを追加する。
 *  - 投稿作成時に OpenAI Embeddings API（text-embedding-3-small）で
 *    ベクトルを生成して保存する。
 *  - searchSimilar() でコサイン類似度検索（pgvector の <=> 演算子）を実装し、
 *    現在の ilike 検索を補完 / 置き換える。
 *  - EmbeddingProvider インターフェースを実装することで
 *    OpenAI 以外のモデルへの差し替えを容易にする。
 */

// ── インターフェース ──────────────────────────────────────────────────────

export interface EmbeddingProvider {
  /** テキストを埋め込みベクトルに変換する */
  embed(text: string): Promise<number[]>;
}

// ── フェーズ2 スタブ ──────────────────────────────────────────────────────

/**
 * ベクトル類似度検索（フェーズ2 未実装）
 *
 * フェーズ2では pgvector + Embedding API を使って
 * クエリに意味的に近い投稿 id を返す。
 *
 * @param _query  検索クエリ文字列
 * @param _limit  取得上限（デフォルト 20）
 * @returns       現時点では常に空配列
 */
// TODO: フェーズ2 — pgvector + Embedding API
export async function searchSimilar(
  _query: string,
  _limit: number = 20,
): Promise<never[]> {
  // TODO: フェーズ2 — pgvector + Embedding API
  // 実装例:
  //   const provider = new OpenAIEmbeddingProvider(process.env.OPENAI_API_KEY!);
  //   const vec = await provider.embed(_query);
  //   const { data } = await supabase.rpc("match_posts", { query_embedding: vec, match_count: _limit });
  //   return data ?? [];
  return [];
}
