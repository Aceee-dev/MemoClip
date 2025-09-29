import { clipboard as electronClipboard } from 'electron';
import clipboard from 'clipboard-event';
import { ClassificationService } from './ClassificationService';
import { PersistenceService } from './PersistenceService';

export class ClipboardManager {
  private classificationService: ClassificationService;
  private persistenceService: PersistenceService;
  private onUpdate: (clip: any) => void;

  constructor(
    classificationService: ClassificationService,
    persistenceService: PersistenceService,
    onUpdate: (clip: any) => void
  ) {
    this.classificationService = classificationService;
    this.persistenceService = persistenceService;
    this.onUpdate = onUpdate;

    clipboard.on('change', async () => {
      const text = electronClipboard.readText();
      if (text) {
        const result = await this.classificationService.classify(text);
        this.persistenceService.addClip(result);
        if (this.onUpdate) {
          this.onUpdate(result);
        }
      }
    });
  }

  public startMonitoring() {
    clipboard.startListening();
  }

  public stopMonitoring() {
    clipboard.stopListening();
  }
}
