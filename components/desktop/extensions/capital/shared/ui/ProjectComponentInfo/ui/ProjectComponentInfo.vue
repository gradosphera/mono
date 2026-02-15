<template lang="pug">
.projects-info
  .project-link(
    v-if='parentTitle',
    @click.stop='navigateToProject(parentHash)'
  )
    q-icon(name='fa-regular fa-folder', size='xs').q-mr-xs
    span.list-item-title {{ parentTitle }}
  .component-link(
    v-if='title',
    @click.stop='navigateToComponent(projectHash)'
  )
    q-icon(name='fa-regular fa-file-code', size='xs').q-mr-xs
    span.list-item-title {{ title }}
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

interface Props {
  title?: string;
  parentTitle?: string;
  projectHash?: string;
  parentHash?: string;
}

const { parentHash, projectHash } = defineProps<Props>();

const router = useRouter();

// Функция навигации к проекту (родительскому)
const navigateToProject = (hash?: string) => {
  if (hash) {
    router.push({
      name: 'project-description',
      params: { project_hash: hash },
      query: { _useHistoryBack: 'true' }
    });
  }
};

// Функция навигации к компоненту
const navigateToComponent = (hash?: string) => {
  if (hash) {
    router.push({
      name: 'component-description',
      params: { project_hash: hash },
      query: { _useHistoryBack: 'true' }
    });
  }
};
</script>

<style lang="scss" scoped>
.projects-info {
  .component-link {
    display: block;
    cursor: pointer;
    margin-bottom: 4px;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s ease;

    margin-left: 16px;
    border-left: 2px solid #666;

    &:hover {
      background-color: rgba(25, 118, 210, 0.08);
    }

    .component-title {
      font-size: 0.875rem;
      font-weight: 500;
      word-wrap: break-word;
      white-space: normal;
      line-height: 1.3;
    }
  }

  .project-link {
    display: block;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .project-title {
      font-size: 0.875rem;
      word-wrap: break-word;
      white-space: normal;
      line-height: 1.3;
    }
  }
}
</style>
