<template lang="pug">
ListOfParticipantsWidget
  template(#top)
    AddUserDialog

  template(#default="{ expand, receiver }")

    ListOfDocumentsWidget(v-if="expand" :receiver="receiver")
</template>

<script lang="ts" setup>
import { ListOfParticipantsWidget } from 'src/widgets/Cooperative/Participants/ListOfParticipants';
import { ListOfDocumentsWidget } from 'src/widgets/Cooperative/Documents/ListOfDocuments';
import { AddUserDialog } from 'src/features/Registrator/AddUser/ui/AddUserDialog';
</script>
