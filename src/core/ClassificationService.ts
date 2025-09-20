export type ClassificationType = 'Link' | 'Text' | 'Other';
export type LinkSubType = 'Study' | 'Sports' | 'News' | 'OtherLink';

export interface ClassificationResult {
  type: ClassificationType;
  subType?: LinkSubType;
  content: string;
}

export class ClassificationService {
  public classify(text: string): ClassificationResult {
    if (/https?:\/\/.+/.test(text)) {
      return {
        type: 'Link',
        subType: this.classifyLinkSubType(text),
        content: text
      };
    }
    if (text.length < 200) {
      return { type: 'Text', content: text };
    }
    return { type: 'Other', content: text };
  }

  private classifyLinkSubType(url: string): LinkSubType {
    const lower = url.toLowerCase();
    if (/\b(wikipedia|khanacademy|coursera|edx|udemy|github|docs|tutorial|learn|study)\b/.test(lower)) return 'Study';
    if (/\b(espn|cricinfo|nba|fifa|football|cricket|tennis|sports)\b/.test(lower)) return 'Sports';
    if (/\b(news|bbc|cnn|nytimes|guardian|reuters|timesofindia|hindustantimes)\b/.test(lower)) return 'News';
    return 'OtherLink';
  }
}
