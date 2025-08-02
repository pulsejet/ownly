<template>
  <div class="revealviewer" ref="revealviewer" v-html="mdHtml"></div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue';

import * as Y from 'yjs';
import Reveal from 'reveal.js';
import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js';
import Highlight from 'reveal.js/plugin/highlight/highlight.esm.js';
// import 'highlight.js/styles/vs.min.css';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/solarized.css';
import { debounce } from 'lodash-es';

const mdText = ref('');
const mdHtml = ref('');
const revealDeck = ref(null as Reveal.Api | null);

const props = defineProps({
  ytext: {
    type: Object as PropType<Y.Text>,
    required: true,
  },
  basename: {
    type: String,
    required: true,
  },
});

const debouncedRefresh = async () => {
  const state = revealDeck.value?.getState();
  revealDeck.value?.destroy();
  revealDeck.value = new Reveal({
    embedded: true,
    slideNumber: true,
    plugins: [Markdown, Highlight],
    transition: 'none',
  });
  await revealDeck.value.initialize();
  // Scroll to current slide
  if (state) {
    revealDeck.value.setState(state);
  }
};

const observeText = debounce(async () => {
  mdText.value = props.ytext.toString();
  mdHtml.value = `<div class="reveal">
      <div class="slides">
        <section data-markdown>
          <textarea data-template>${mdText.value}</textarea>
        </section>
      </div>
    </div>`;
  await nextTick();
  await debouncedRefresh();
}, 250);

const create = async () => {
  props.ytext.observe(observeText);
  await observeText();
};

const destroy = () => {
  props.ytext.unobserve(observeText);
  revealDeck.value?.destroy();
};

watch(
  () => props.ytext,
  () => {
    destroy();
    create();
  },
);
onMounted(create);
onBeforeUnmount(destroy);
</script>
