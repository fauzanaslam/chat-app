<template>
  <VContainer>
    <VForm @submit.prevent="onSubmit">
      <VCard class="mx-auto pa-5" max-width="600">
        <VCardTitle>
          <div class="d-flex align-center justify-center">
            <VIcon icon="mdi-chat" />
            <h3 class="ml-2">Vue Chatapp</h3>
          </div>
        </VCardTitle>
        <VCardText class="py-4">
          <VTextField v-model="state.username" label="Username" />
          <VSelect v-model="state.room" :items="rooms" label="Room" />
        </VCardText>
        <VCardActions>
          <VBtn
            block
            color="primary"
            :disabled="!state.username || !state.room"
            type="submit"
            variant="outlined"
          >
            Join Chatapp
          </VBtn>
        </VCardActions>
      </VCard>
    </VForm>
  </VContainer>
</template>

<script lang="ts" setup>
  import { reactive } from 'vue';
  import { useRouter } from 'vue-router';
  const router = useRouter();
  const rooms = ['vue installation', 'vue guide', 'vue api', 'vue examples'];
  const state = reactive({
    username: '',
    room: rooms[0],
  });
  const onSubmit = () => {
    console.log('[SUBMIT]');
    router.push(`/chat?username=${state.username}&room=${state.room}`);
  };


</script>
