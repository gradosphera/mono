<template lang="pug">
div
  div(v-if="!currentObject && objects && objects?.length > 0")
    div(v-for="object in objects" :key="object.id").q-pa-md
      q-card(flat bordered).row
        div.q-pa-md.col-md-4.col-xs-12
          p # {{ object.id }}
            q-badge(v-if="object.status == 'moderation'" color="orange") ожидает модерации
            q-badge(v-if="object.status == 'published'" color="green") опубликовано
            q-badge(v-if="object.status == 'prohibit'" color="red") отказано
            q-badge(v-if="object.status == 'unpublished'" color="orange") снято с публикации

          ImageCarousel(:images="object.data.images")
          div.row
            ProhibitRequestButton(v-if="object.status == 'moderation' || object.status == 'unpublished'" :coopname="coopname" :username="username" :request-id="Number(object.id)")
            ModerateRequestButton(v-if="object.status == 'moderation' || object.status == 'prohibit'" :coopname="coopname" :username="username" :request-id="Number(object.id)")
            PublishRequestButton(v-if="object.status == 'unpublished'" :coopname="coopname" :username="username" :request-id="Number(object.id)")
            UnpublishRequestButton(v-if="object.status == 'published'" :disabled="String(object.status) == 'moderation'" :coopname="coopname" :username="username" :request-id="Number(object.id)")

        div.q-pa-md.col-md-8.col-xs-12
          q-input(v-model="object.username" readonly label="Поставщик")
          q-input(v-if="object.data.title" v-model="object.data.title" readonly label="Заголовок")
          q-input(v-if="object.data.description" v-model="object.data.description" readonly label="Описание" type="textarea" rows="5")
          q-input(v-model="object.unit_cost" readonly label="Цена")

  div(v-if="currentObject")
    p {{ currentObject }}
    // TODO здесь может быть администраторская страница конкретного продукта


</template>
<script setup lang="ts">
import { computed } from 'vue'
import { ImageCarousel } from 'src/shared/ui/ImageCarousel'

import { useRouter } from 'vue-router'
import { useRequestStore } from 'src/entities/Request/model/stores'
import { PublishRequestButton } from 'src/features/Request/PublishRequest'
import { UnpublishRequestButton } from 'src/features/Request/UnpublishRequest'
import { ModerateRequestButton } from 'src/features/Request/ModerateRequest'
import { ProhibitRequestButton } from 'src/features/Request/ProhibitRequest'
import { useSessionStore } from 'src/entities/Session'
import { COOPNAME } from 'src/shared/config'
const session = useSessionStore()
const username = computed(() => session.username)

const router = useRouter()

const coopname = computed(() => COOPNAME)
const requstsStore = useRequestStore()

const objects = computed(() => requstsStore.allParentOffers)

const currentObjectId = computed(() => router.currentRoute.value.params.id)

const currentObject = computed(() =>
  objects.value.find((obj) => obj.id == Number(currentObjectId.value))
)
</script>
