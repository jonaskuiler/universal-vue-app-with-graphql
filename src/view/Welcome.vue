<template>
  <div class="view">
    <h1>{{ message }}</h1>
  </div>
</template>

<style scoped>
  .view {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    font-family: 'Roboto', sans-serif;
  }
</style>

<script>
  import gql from 'graphql-tag'

  export default {
    name: 'welcome',
    apollo: {
      message: {
        query: gql`
          {
            message
          }
        `,

        // http://localhost:47274/graphql?query={message}

        // note that we're using "prefetch" here
        // it will let apolloProvider know that
        // we also want to fetch this content server side
        prefetch: true
      }
    },
    data () {
      return {
        // default value for the message
        message: null
      }
    }
  }
</script>
