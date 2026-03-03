# Альтернативы при проблемах с аудио rtc-node

Если `AudioStream` из `@livekit/rtc-node` даёт непригодный для распознавания звук (шум, бульканье), рассмотрите обходные варианты:

## 1. LiveKit Track Egress (диагностика)

**Идея**: Запись трека через Egress (другая реализация, не rtc-node).  
Если файл с Egress звучит нормально — проблема в rtc-node.

**Условия**: LiveKit Cloud или self-hosted Egress.

```ts
import { EgressClient } from 'livekit-server-sdk';

const egress = new EgressClient(livekitUrl, apiKey, apiSecret);
const info = await egress.startTrackEgress({
  roomName: room.name,
  trackId: track.sid,
  file: { filepath: `/tmp/egress_${track.sid}.ogg` },
});
// Файл Ogg/Opus — декодировать: ffmpeg -i file.ogg -ar 16000 -ac 1 out.wav
```

## 2. @livekit/agents и Voice Pipeline

**Идея**: Использовать фреймворк Agents с готовым STT вместо собственной подписки на треки.

- Официальный pipeline, где аудио уже проверено
- Поддержка Deepgram, AssemblyAI и др.
- Примеры: [agent-starter-node](https://github.com/livekit-examples/agent-starter-node)

**Минус**: Другой стиль интеграции (Worker, JobContext), не встраивается в текущий controller “напрямую”.

## 3. Другой клиент для проверки

**Идея**: Проверить, зависит ли проблема от Element-call.

- [LiveKit Playground](https://meet.livekit.io) или простой Web SDK клиент
- Записать звонок и убедиться, что секретарь получает такой же поток
- Если с Playground всё ок — возможна специфика Element-call/Matrix VoIP

## 4. Issue в LiveKit

При наличии воспроизводимой проблемы имеет смысл открыть issue:

- Репозиторий: https://github.com/livekit/node-sdks (или livekit/rtc-node)
- Приложить: пример `.raw`, параметры воспроизведения, версии пакетов, описание воспроизведения

## Что уже проверено

- Явная запись через `writeInt16LE`
- Byte-swap, planar→interleaved
- Формат .raw и .wav
- 48k stereo и 16k mono
- Фильтр по `source`
- Корректные параметры: `-c 2` для stereo, `-r 48000`
