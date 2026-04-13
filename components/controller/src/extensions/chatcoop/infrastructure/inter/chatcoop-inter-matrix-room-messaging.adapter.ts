import { Injectable } from '@nestjs/common';
import type {
  InterMatrixReplaceTextMessageInput,
  InterMatrixRoomMessagingPort,
  InterMatrixSendTextAndPinInput,
  InterMatrixSendTextMessageInput,
  InterMatrixUnpinAndRedactAnnouncementInput,
} from '@coopenomics/inter';
import { MatrixApiService } from '../../application/services/matrix-api.service';

@Injectable()
export class ChatcoopInterMatrixRoomMessagingAdapter implements InterMatrixRoomMessagingPort {
  constructor(private readonly matrixApi: MatrixApiService) {}

  async sendTextMessage(input: InterMatrixSendTextMessageInput): Promise<string> {
    return this.matrixApi.sendMessage(input.matrixRoomId, input.plainTextBody);
  }

  async sendTextMessageAndPin(input: InterMatrixSendTextAndPinInput): Promise<string> {
    return this.matrixApi.sendTextMessageAndPin(input.matrixRoomId, input.plainTextBody);
  }

  async replaceTextMessage(input: InterMatrixReplaceTextMessageInput): Promise<void> {
    await this.matrixApi.replaceTextMessage(input.matrixRoomId, input.rootEventId, input.plainTextBody);
  }

  async unpinAndRedactAnnouncement(input: InterMatrixUnpinAndRedactAnnouncementInput): Promise<void> {
    await this.matrixApi.unpinAndRedactRootMessage(input.matrixRoomId, input.rootEventId);
  }
}
