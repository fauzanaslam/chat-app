<template>
  <VContainer>
    <VCard class="mx-auto pa-5">
      <VCardTitle class="pb-5">
        <div class="d-flex align-center justify-space-between text-primary">
          <div class="d-flex align-center">
            <VIcon icon="mdi-chat" />
            <div class="font-weight-bold text-h6 ml-2">Vue Chatapp</div>
          </div>
          <VBtn
            class="text-capitalize"
            color="primary"
            elevation="0"
            @click="leaveRoom"
          >
            Leave {{ $route.query.room }}
          </VBtn>
        </div>
      </VCardTitle>
      <VDivider />

      <VCardText class="py-6 px-0">
        <div class="d-flex">
          <!-- Sidebar -->
          <div class="bg-grey-lighten-3 py-4 px-6">
            <div class="mb-4">
              <div class="d-flex align-center mb-2 px-3 py-2 rounded-md bg-white">
                <VIcon icon="mdi-chat-outline" />
                <div class="text-body-1 ml-2">Room Name</div>
              </div>
              <div class="mb-2 text-body-1 ml-2 text-capitalize">{{ currentRoom }}</div>
            </div>
            <div class="d-flex align-center mb-2 px-3 py-2 rounded-md bg-white">
              <VIcon icon="mdi-account-group-outline" />
              <div class="text-body-1 ml-2">Users</div>
            </div>
            <v-list>
              <v-list-item v-for="(user, i) in users" :key="i">
                <v-list-item-title>{{ user.username }}</v-list-item-title>
                <VDivider v-if="user.username === route.query.username" />
              </v-list-item>
            </v-list>
          </div>
          <!-- Chat -->
          <div class="overflow-y-auto pl-6 flex-fill" style="height: 400px">
            <div
              v-for="(chat, i) in chats"
              :key="i"
              class="bg-transparent w-full mb-3 d-flex"
              :class="{
                'justify-center': chat.username === 'Vue Chatapp Admin',
                'justify-end': chat.username === route.query.username,
                'justify-start': chat.username !== route.query.username,
              }"
            >
              <div
                class="px-6 py-2 w-50 rounded-md mb-3"
                :class="{
                  'bg-red-lighten-4': chat.username === 'Vue Chatapp Admin',
                  'bg-blue-lighten-5': chat.username === route.query.username,
                  'bg-light-green-lighten-4':
                    chat.username !== route.query.username &&
                    chat.username !== 'Vue Chatapp Admin',
                }"
              >
                <div class="d-flex align-center gap-x-3">
                  <div class="text-xs text-primary font-semibold">
                    {{ chat.username }}
                  </div>
                  <div class="text-xs">{{ chat.time }}</div>
                </div>
                <div class="mt-1 text-body-1">
                  {{ chat.text }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </VCardText>
      <VDivider />
      <VCardActions class="pt-6">
        <form class="w-100" @submit.prevent="onSubmit">
          <div class="d-flex align-center">
            <VTextField
              v-model="message"
              class="flex-grow-1"
              elevation="0"
              hide-details
              placeholder="Type your message..."
              rounded="lg"
              variant="solo"
            />
            <v-btn
              class="ml-3 bg-primary text-white px-6"
              icon="mdi-send"
              rounded="lg"
              type="submit"
            />
          </div>
        </form>
      </VCardActions>
    </VCard>
  </VContainer>
</template>

<script setup lang="ts">
  type Chat = {
    username: string;
    text: string;
    time: string;
    room?: string;
  };
  type User = {
    id: string;
    username: string;
    room: string;
  };
  import { useRoute, useRouter } from 'vue-router';
  import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
  import { io, type Socket } from 'socket.io-client';
  const route = useRoute();
  const router = useRouter();

  const message = ref('');
  const chats = ref<Chat[]>([

  ]);
  const users = ref<User[]>([

  ]);
  const currentRoom = ref('')
  const socket = ref<Socket>();
  const onSubmit = async () => {

    socket.value?.emit('chatMessage', message.value);
    await nextTick(() => message.value = '')
  }
  onMounted(() => {
    socket.value = io('https://chat-app-production-0d1d.up.railway.app');
    const { username, room } = route.query as Partial<Chat>;

    if (!username || !room) {
      router.push('/')
    }
    socket.value?.emit('joinRoom', { username, room });
    socket.value?.on('roomUsers', (response: { room: string, users: User[] }) => {
      users.value = response.users
      currentRoom.value = response.room
    })
    socket.value?.on('message', (message: Chat) => {
      chats.value.push(message)
    })

  });
  onBeforeUnmount(() => {
    console.log('[DISCONNECT_BLOCK]');
    socket.value?.disconnect();
  })

  const leaveRoom = () => {
    socket.value?.emit('leaveRoom');
    router.push('/')
  }
</script>

<style scoped></style>
