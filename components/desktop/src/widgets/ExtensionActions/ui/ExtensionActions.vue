<template lang="pug">
.row(v-if='isSettings')
  SaveButton(
    :extension-name='extension?.name',
    :extension-enabled='extension?.enabled ?? false',
    :config='config',
    :my-form-ref='formRef',
    :is-empty='isEmpty ?? false'
  )
.q-gutter-sm.text-center(v-if='isMain && !extension.is_installed')
  q-btn.full-width(
    color='teal',
    @click='router.push({ name: "extension-install" })'
  ) установить

  // Показываем список рабочих столов под кнопкой
  DesktopsList(:desktops='extension.desktops')

.q-gutter-sm.text-center(v-if='isInstall && !extension.is_installed')
  // это установка
  InstallButton(
    :extension-name='extension?.name',
    :config='config',
    :my-form-ref='formRef'
  )

  // Показываем список рабочих столов под кнопкой установки
  DesktopsList(:desktops='extension.desktops')

div(v-if='isMain && extension.is_installed')
  SettingsButton
  .q-mt-sm(v-if='extension.is_builtin')
    p.text-center.text-grey минимальное расширение
  .row(v-else)
    .col-6.q-pa-sm
      DisableButton(
        v-if='extension.enabled'
        :extension='extension',
        :disabled='extension.is_builtin'
      )
      EnableButton(
        v-if='!extension.enabled'
        :extension-name='extension.name',
        :config='extension.config',
        :disabled='extension.is_builtin'
      )

    .col-6.q-pa-sm
      UninstallButton(
        :extension-name='extension.name',
        :disabled='extension.is_builtin'
      )

  // Показываем список рабочих столов под кнопками настроек
  DesktopsList(:desktops='extension.desktops')
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { IExtension } from 'src/entities/Extension/model/types';
import {
  SaveButton,
  SettingsButton,
} from 'src/features/Extension/UpdateExtension';
import { UninstallButton } from 'src/features/Extension/UninstallExtension';
import { InstallButton } from 'src/features/Extension/InstallExtension';
import { EnableButton } from 'src/features/Extension/EnableExtension';
import { DisableButton } from 'src/features/Extension/DisableExtension';
import { DesktopsList } from 'src/widgets/ExtensionDesktopsList';

interface Props {
  extension: IExtension;
  mode: 'main' | 'install' | 'settings';
  config?: any;
  formRef?: any;
  isEmpty?: boolean;
}

const props = defineProps<Props>();
const router = useRouter();

const isMain = computed(() => props.mode === 'main');
const isInstall = computed(() => props.mode === 'install');
const isSettings = computed(() => props.mode === 'settings');
</script>
