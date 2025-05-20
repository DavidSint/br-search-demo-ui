export interface SearchResultDoc {
  pid: string;
  url: string;
  title: string;
  introduction: string;
}

export interface BloomreachApiResponse {
  response: {
    numFound: number;
    start: number;
    docs: SearchResultDoc[];
  };
  category_map?: Record<string, unknown>;
  did_you_mean?: string[];
}