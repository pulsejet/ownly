<template>
  <div class="wrapper">
    <img alt="logo" class="logo" src="@/assets/logo-white.svg" />
    <hr class="logo-sep" />

    <div class="header is-size-4">
      A workspace <b>only</b> you <b>own</b>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.wrapper {
  width: 100%;
  margin: 0 auto;
  padding: 20px 0;
  color: white;
}

img.logo {
  display: block;
  width: 200px;
  margin: 0 auto;
}

hr.logo-sep {
  border: 0;
  border-top: 3px solid white;
  border-radius: 5px;
  margin: 10px 0;
}

.header {
  text-align: center;
}

@media (min-width: 1024px) {
  .wrapper {
    margin: auto 20px;
    margin-left: 120px;
    padding-bottom: 80px;
  }

  img.logo {
    margin: 10px 0;
    width: 250px;
  }

  hr.logo-sep {
    max-width: 500px;
  }

  .header {
    text-align: left;
  }
}
</style>
