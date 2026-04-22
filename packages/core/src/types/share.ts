export interface ShareData {
  toolId: string;
  content: string;
  metadata?: {
    title?: string;
    description?: string;
    schemaVersion: string;
  };
}

export interface ShareResult {
  id: string;
  url: string;
  createdAt: string;
}