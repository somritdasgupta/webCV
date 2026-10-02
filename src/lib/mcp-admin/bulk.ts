import { type PostRecord } from "./corpus";
import { OperationError } from "./errors";
import { buildMdx, estimateReadingTime, type Frontmatter } from "./mdx";

export const MAX_BATCH = 100;

/** Re-serialize a post with metadata overrides, always in the canonical format. */
export function rebuild(post: PostRecord, overrides: Partial<Frontmatter> = {}, body = post.body): string {
  return buildMdx(
    {
      title: post.title,
      description: post.description,
      date: post.date,
      tags: post.tags.length ? post.tags : undefined,
      cover: post.cover,
      draft: post.draft,
      ...overrides,
      readingTime: estimateReadingTime(body),
    },
    body,
  );
}

export function assertBatchSize(count: number, field: string) {
  if (count > MAX_BATCH) {
    throw new OperationError("LIMIT_EXCEEDED", `At most ${MAX_BATCH} items per call (received ${count}).`, {
      field,
      guidance: `Split the request into batches of ${MAX_BATCH} or fewer.`,
    });
  }
}
