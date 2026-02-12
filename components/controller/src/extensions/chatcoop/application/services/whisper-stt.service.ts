import { Injectable, Logger } from '@nestjs/common';
import config from '~/config/config';

// Утилита для создания WAV-заголовка из PCM-данных
function createWavBuffer(pcmBuffer: Buffer, sampleRate: number, channels: number, bitsPerSample: number): Buffer {
  const dataSize = pcmBuffer.length;
  const headerSize = 44;
  const fileSize = headerSize + dataSize;
  const header = Buffer.alloc(headerSize);

  // RIFF chunk descriptor
  header.write('RIFF', 0);
  header.writeUInt32LE(fileSize - 8, 4);
  header.write('WAVE', 8);

  // fmt sub-chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
  header.writeUInt16LE(1, 20); // AudioFormat (PCM = 1)
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), 28); // ByteRate
  header.writeUInt16LE(channels * (bitsPerSample / 8), 32); // BlockAlign
  header.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

/**
 * Сервис для распознавания речи через OpenAI Whisper API
 * Использует chatcoop-proxy nginx для проксирования запросов к OpenAI
 */
@Injectable()
export class WhisperSttService {
  private readonly logger = new Logger(WhisperSttService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly language: string;

  constructor() {
    this.apiKey = config.openai?.api_key || '';
    this.baseUrl = config.openai?.base_url || 'https://api.openai.com/v1';
    this.model = config.openai?.whisper_model || 'whisper-1';
    this.language = config.openai?.whisper_language || 'ru';
  }

  /**
   * Проверяет, настроен ли сервис для работы
   */
  isConfigured(): boolean {
    return !!this.apiKey && !!this.baseUrl;
  }

  /**
   * Транскрибирует аудио-буфер через Whisper API
   * @param pcmBuffer - PCM-данные (16-bit, mono)
   * @param sampleRate - Частота дискретизации (по умолчанию 48000)
   * @param language - Язык распознавания (по умолчанию из конфигурации)
   * @returns Распознанный текст
   */
  async transcribe(pcmBuffer: Buffer, sampleRate = 48000, language?: string): Promise<string> {
    if (!this.isConfigured()) {
      this.logger.warn('WhisperSttService не настроен (отсутствует OPENAI_API_KEY или OPENAI_BASE_URL)');
      return '';
    }

    try {
      // Создаем WAV-буфер из PCM-данных
      const wavBuffer = createWavBuffer(pcmBuffer, sampleRate, 1, 16);

      // Формируем multipart/form-data запрос
      const formData = new FormData();
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      formData.append('file', blob, 'audio.wav');
      formData.append('model', this.model);
      formData.append('language', language || this.language);
      formData.append('response_format', 'text');

      // Отправляем запрос к Whisper API через chatcoop-proxy
      const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Whisper API error (${response.status}): ${errorText}`);
      }

      const text = await response.text();
      return text.trim();
    } catch (error) {
      this.logger.error(`Ошибка транскрипции Whisper: ${error}`);
      return '';
    }
  }
}
