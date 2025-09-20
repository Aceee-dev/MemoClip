import { clipboard } from 'electron';
import { ClassificationService, ClassificationResult } from './ClassificationService';
import { PersistenceService } from './PersistenceService';

export class ClipboardManager {
  private lastText: string = '';
  private intervalId: NodeJS.Timeout | null = null;
  private classificationService: ClassificationService;
  private persistenceService: PersistenceService;

  constructor(classificationService: ClassificationService, persistenceService: PersistenceService) {
    this.classificationService = classificationService;
    this.persistenceService = persistenceService;
  }

  public startMonitoring() {
    this.lastText = clipboard.readText();
    this.intervalId = setInterval(() => {
      const text = clipboard.readText();
      if (text && text !== this.lastText) {
        const result = this.classificationService.classify(text);
        this.persistenceService.addClip(result);
        this.lastText = text;
      }
    }, 500);
  }

  public stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
