<template lang="pug">
div.q-pa-md
  div.row
    div.col-md-12.col-xs-12
      q-card(flat class="card-container q-pa-md")
        div.row
          div.col-12.col-md-3.flex.justify-center.align-start
            AutoAvatar(class="profile-avatar" :username="currentUser.userAccount?.username || 'user'")

          div.col-12.col-md-9
            div.row
              div.col-12.info-card
                div.row.q-mb-md
                  div.col-12
                    div.text-h4.q-mb-xs
                      span(v-if="isIP").q-mr-sm ИП
                      | {{displayName}}
                    q-badge(color="primary" class="user-role") {{role}}



                CopyableInput(
                  label="Имя аккаунта"
                  standout="bg-teal text-white"
                  dense
                  :model-value="currentUser.userAccount?.username || ''"
                  input-class="q-mt-md"
                ).q-mb-md

                EditableIndividualCard(
                  v-if="userType === 'individual' && individualProfile"
                  :participantData="individualProfile"
                  :readonly="true"
                )
                EditableEntrepreneurCard(
                  v-if="userType === 'entrepreneur' && entrepreneurProfile"
                  :participantData="entrepreneurProfile"
                  :readonly="true"
                )
                EditableOrganizationCard(
                  v-if="userType === 'organization' && organizationProfile"
                  :participantData="organizationProfile"
                  :readonly="true"
                )
</template>

<script lang="ts" setup>
import { AutoAvatar } from 'src/shared/ui/AutoAvatar';
import { useCurrentUserStore } from 'src/entities/User';
import type { IEntrepreneurData, IIndividualData, IOrganizationData } from 'src/shared/lib/types/user/IUserData';
import { computed } from 'vue';
import { EditableIndividualCard } from 'src/shared/ui/EditableIndividualCard';
import { EditableEntrepreneurCard } from 'src/shared/ui/EditableEntrepreneurCard';
import { EditableOrganizationCard } from 'src/shared/ui/EditableOrganizationCard';
import { useDisplayName } from 'src/shared/lib/composables/useDisplayName';
import { CopyableInput } from 'src/shared/ui/CopyableInput';
import 'src/shared/ui/CardStyles/index.scss';

const currentUser = useCurrentUserStore();

const userType = computed(() => currentUser.userAccount?.type);

const userProfile = computed(() => {
  return currentUser.userAccount?.private_data as IEntrepreneurData | IIndividualData | IOrganizationData | null;
});

const individualProfile = computed(() => {
  if (userType.value === 'individual') {
    return userProfile.value as IIndividualData;
  }
  return null;
});

const entrepreneurProfile = computed(() => {
  if (userType.value === 'entrepreneur') {
    return userProfile.value as IEntrepreneurData;
  }
  return null;
});

const organizationProfile = computed(() => {
  if (userType.value === 'organization') {
    return userProfile.value as IOrganizationData;
  }
  return null;
});

const { displayName, isIP } = useDisplayName(userProfile.value);

const role = computed(() => {
  if (currentUser.userAccount?.role === 'user')
    return 'Пайщик';
  else if (currentUser.userAccount?.role === 'member')
    return 'Член совета';
  else if (currentUser.userAccount?.role === 'chairman')
    return 'Председатель совета';
  else return '';
});

</script>

<style lang="scss" scoped>
.profile-avatar {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
}

.user-role {
  font-size: 14px;
  padding: 4px 8px;
}
</style>
