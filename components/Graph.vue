<script setup lang="ts">
import { Chart as highcharts } from "highcharts-vue";

const props = defineProps(["series"]);
</script>

<template>
  <highcharts
    :options="{
      chart: {
        type: 'area', // Basic area chart
        lang: {
          numericSymbols: null, //otherwise by default ['k', 'M', 'G', 'T', 'P', 'E']
        },
      },

      xAxis: {
        title: {
          text: 'Years',
        },
        //categories: ['Apples', 'Bananas', 'Oranges'],
      },
      yAxis: {
        title: {
          text: 'Capital',
        },
        labels: {
          formatter: function () {
            return this.value + ' €'; // TODO: The Currency should be variable
          },
        },
      },
      series: [
        {
          name: 'Capital accumulation',
          data: series,
        },
      ],
      tooltip: {
        formatter: function () {
          return `After ${
            this.x
          } years there would be a capital of ${this.y.toFixed(2)}€`;
        },
      },
    }"
  ></highcharts>
</template>

<style scoped></style>
