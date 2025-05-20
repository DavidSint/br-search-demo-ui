export interface SearchResultDoc {
  pid: string;
  url: string;
  title: string;
  introduction: string;
}

type Url = string;
export interface KeywordRedirect {
  "redirected url": Url;
  "original query": string;
  "redirected query": string;
}

export interface BloomreachApiResponse {
  response: {
    numFound: number;
    start: number;
    docs: SearchResultDoc[];
  };
  category_map?: Record<string, unknown>;
  did_you_mean?: string[];
  autoCorrectQuery?: string;
  keywordRedirect?: KeywordRedirect;
  'relaxed.query'?: string;
}