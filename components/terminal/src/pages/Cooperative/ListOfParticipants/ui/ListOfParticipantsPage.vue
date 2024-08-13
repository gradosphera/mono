<template lang="pug">
ListOfParticipantsWidget
  template(#top)
    AddUserButton

  template(#default="{ expand, receiver }")
    ListOfDocumentsWidget(v-if="expand" :reciever="receiver")
</template>

<script lang="ts" setup>
import { ListOfParticipantsWidget } from 'src/widgets/Cooperative/Participants/ListOfParticipants';
import { ListOfDocumentsWidget } from 'src/widgets/Cooperative/Documents/ListOfDocuments';
import { AddUserButton } from 'src/features/User/CreateUser/ui/AddUserButton';
</script>
