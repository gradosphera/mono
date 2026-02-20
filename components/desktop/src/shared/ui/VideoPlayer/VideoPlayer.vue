<template lang="pug">
div.video-player-container(v-if="videoUrl")
  .video-wrapper
    iframe(
      :src="sanitizedUrl"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    )
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  url: string;
}>();

const videoUrl = computed(() => {
  if (!props.url) return '';
  
  // Декодируем HTML сущности на случай, если iframe пришел в заэнкоженном виде
  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  const decodedUrl = props.url.includes('&lt;') ? decodeHtml(props.url) : props.url;

  // Если передали полный iframe, пытаемся вытащить src
  if (decodedUrl.includes('<iframe')) {
    const match = decodedUrl.match(/src=["']([^"']+)["']/);
    return match ? match[1] : '';
  }
  
  return decodedUrl;
});

const sanitizedUrl = computed(() => {
  if (!videoUrl.value) return '';
  
  let url = videoUrl.value;

  // Базовая проверка протокола
  if (!url.startsWith('http') && !url.startsWith('//')) {
    return '';
  }

  // Если это youtube ссылка не для вставки, пробуем преобразовать (на всякий случай)
  if (url.includes('youtube.com/watch?v=')) {
    url = url.replace('watch?v=', 'embed/');
  } else if (url.includes('youtu.be/')) {
    url = url.replace('youtu.be/', 'youtube.com/embed/');
  }

  return url;
});
</script>

<style lang="scss" scoped>
.video-player-container {
  width: 100%;
  margin-bottom: 1rem;
}

.video-wrapper {
  position: relative;
  padding-bottom: 56.25%; // 16:9 Aspect Ratio
  height: 0;
  overflow: hidden;
  border-radius: 8px;
  background: #000;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
