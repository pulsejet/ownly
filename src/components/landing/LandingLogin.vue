<template>
  <div class="wrapper">
    <Transition name="fade-rtl" mode="out-in">
      <LoadingSpinner
        v-if="showLoading"
        class="has-text-white-bis has-text-centered"
        :text="loadStatus"
      />

      <div class="box anim-rtl-fade p-4" v-else-if="showEmail">
        <div class="header is-size-4 has-text-weight-semibold">Get started</div>

        <div class="login mt-2">
          <div class="field">
            <label>First, you need an email address to verify your unique identity.</label>
            <div class="control has-icons-left has-icons-right mt-3">
              <input
                :class="{ input: true, 'is-danger': emailError }"
                inputmode="email"
                autocomplete="email"
                type="email"
                placeholder="name@email.com"
                v-model="emailAddress"
                @keyup.enter="emailSubmit"
              />
              <span class="icon is-small is-left">
                <FontAwesomeIcon :icon="faEnvelope" />
              </span>

              <span class="icon is-small is-right" v-if="emailError">
                <FontAwesomeIcon :icon="faExclamationTriangle" />
              </span>
            </div>
            <p v-if="emailError" class="help is-danger">{{ emailError }}</p>
          </div>

          <button class="button mt-3 is-primary is-fullwidth" @click="emailSubmit">Continue</button>
        </div>
      </div>

      <div class="box anim-rtl-fade p-4" v-else-if="showCode">
        <div class="header is-size-4 has-text-weight-semibold">Let's verify you</div>

        <div class="login mt-2">
          <div class="field">
            <label>
              We have sent a verification code to your email address. Enter the code below to
              continue.
            </label>
            <div class="control has-icons-left mt-3">
              <input
                :class="{ input: true, 'is-danger': codeError }"
                inputmode="numeric"
                pattern="[0-9]{6}"
                autocomplete="off"
                type="text"
                placeholder="123456"
                maxlength="6"
                minlength="6"
                v-model="codeInput"
                @keypress="disallowNonNumeric"
                @keyup="codeSubmit"
              />
              <span class="icon is-small is-left">
                <FontAwesomeIcon :icon="faKey" />
              </span>
              <p v-if="codeError" class="help is-danger">{{ codeError }}</p>
            </div>

            <a class="is-size-7 mt-3 ml-1" @click="codeCancel"> Go back to the previous step </a>
          </div>
        </div>
      </div>

      <div class="anim-rtl-fade p-4 has-text-centered" v-else-if="showSuccess">
        <FontAwesomeIcon class="success" :icon="faCircleCheck" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faEnvelope,
  faExclamationTriangle,
  faKey,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';

import * as utils from '@/utils/index';
import ndn from '@/services/ndn';
import { Toast } from '@/utils/toast';

const emit = defineEmits(['login']);

const showLoading = ref(true);
const showEmail = ref(false);
const showCode = ref(false);
const showSuccess = ref(false);

const loadStatus = ref(String());

const emailAddress = ref(String());
const emailError = ref(String());

const codeInput = ref(String());
const codeError = ref(String());
const codeSubmit = ref(() => {});

/** Validate email and move to step 2 */
function emailSubmit() {
  if (!showEmail.value) return;

  if (!emailAddress.value) {
    emailError.value = 'Email address is required';
    return;
  }

  if (!utils.validateEmail(emailAddress.value)) {
    emailError.value = 'Invalid email address';
    return;
  }

  showEmail.value = false;
  startChallenge();
}

/** Cancel code verification and go back to email step */
function codeCancel() {
  showCode.value = false;
  showEmail.value = true;
}

async function startChallenge() {
  showLoading.value = true;

  try {
    // Connect to testbed
    loadStatus.value = 'Connecting to NDN testbed ...';
    await ndn.api.connect_testbed();

    // Start NDN challenge
    loadStatus.value = 'Starting NDNCERT challenge ...';
    await ndn.api.ndncert_email(emailAddress.value, (status) => {
      codeError.value = '';
      codeInput.value = '';

      switch (status) {
        case 'need-code':
          break;
        case 'wrong-code':
          codeError.value = 'Invalid verification code';
          break;
        default:
          codeError.value = 'Verfication error: ' + status;
          break;
      }

      showLoading.value = false;
      showCode.value = true;

      return new Promise((resolve) => {
        codeSubmit.value = () => {
          if (codeInput.value.length !== 6) return;

          showCode.value = false;
          showLoading.value = true;
          loadStatus.value = 'Completing challenge ...';
          resolve(codeInput.value);
        };
      });
    });

    // We are certified!
    loadStatus.value = 'Certified!';
    showLoading.value = false;
    showSuccess.value = true;
    setTimeout(() => emit('login'), 1500);
  } catch (err) {
    Toast.error('Failed to complete challenge');
    console.error(err);
    showLoading.value = false;
    showEmail.value = true;
  }
}

async function setup() {
  try {
    // Entrypoint - make sure service is loaded
    loadStatus.value = 'Setting up NDN service ...';
    await ndn.setup();

    // Check if we are already certified
    if (await ndn.api.has_testbed_key()) {
      showLoading.value = false;
      showSuccess.value = true;
      setTimeout(() => emit('login'), 250);
      return;
    }

    showLoading.value = false;
    showEmail.value = true;
  } catch (err) {
    console.error(err);
  }
}

onMounted(setup);

function disallowNonNumeric(event: KeyboardEvent) {
  if (!/^\d+$/.test(event.key) && !['Backspace', 'Delete'].includes(event.key)) {
    event.preventDefault();
  }
}
</script>

<style scoped lang="scss">
.wrapper {
  display: flex;
  flex-direction: column;
}

.success {
  color: white;
  font-size: 5rem;
}

@media (min-width: 1024px) {
  .wrapper {
    margin: auto;
    margin-right: 10vw;
    min-width: 350px;
  }
}

@media (max-width: 1023px) {
  .wrapper.login {
    max-width: 400px;
    margin: 0 auto;
  }
}
</style>
