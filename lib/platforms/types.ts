import type { Platform } from "@/lib/db/schema";

// Kemampuan yang tidak didukung dinyatakan di sini, bukan dilempar sebagai error acak.
export type PlatformCapabilities = {
  textPost: boolean;
  imagePost: boolean;
  videoPost: boolean;
  comments: boolean;
  replies: boolean;
  insights: boolean;
};

export type TokenSet = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date;
};

export type ConnectedAccount = TokenSet & {
  externalUserId: string;
  handle: string;
};

export type PublishInput = {
  accessToken: string;
  externalUserId: string;
  caption: string;
  // Container yang sudah dibuat. Retry wajib memakai id yang sama.
  creationId?: string;
};

export type PublishResult = {
  externalPostId: string;
  creationId: string;
};

export type PlatformComment = {
  externalId: string;
  authorHandle: string;
  text: string;
  createdAt: Date;
};

export type MetricPoint = {
  name: string;
  value: number;
  capturedAt: Date;
};

export interface PlatformAdapter {
  platform: Platform;
  capabilities: PlatformCapabilities;
  connect(input: { code: string; redirectUri: string }): Promise<ConnectedAccount>;
  refreshToken(input: TokenSet): Promise<TokenSet>;
  publish(input: PublishInput): Promise<PublishResult>;
  fetchComments(input: {
    accessToken: string;
    externalPostId: string;
  }): Promise<PlatformComment[]>;
  replyToComment(input: {
    accessToken: string;
    externalPostId: string;
    text: string;
  }): Promise<{ externalId: string }>;
  fetchMetrics(input: {
    accessToken: string;
    externalUserId: string;
  }): Promise<MetricPoint[]>;
}
