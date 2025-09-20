import * as fs from 'fs';
import * as path from 'path';
import { ClassificationResult } from './ClassificationService';

export class PersistenceService {
  private dataFile: string;
  private clips: ClassificationResult[] = [];

  constructor(dataFilePath: string) {
    this.dataFile = dataFilePath;
    this.restore();
  }

  public addClip(clip: ClassificationResult) {
    this.clips.push(clip);
    this.save();
  }

  public getClips() {
    return this.clips;
  }

  private save() {
    fs.writeFileSync(this.dataFile, JSON.stringify(this.clips, null, 2));
  }

  private restore() {
    if (fs.existsSync(this.dataFile)) {
      try {
        const data = fs.readFileSync(this.dataFile, 'utf-8');
        this.clips = JSON.parse(data);
      } catch (err) {
        this.clips = [];
      }
    }
  }
}
