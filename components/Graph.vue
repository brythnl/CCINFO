<script setup lang="ts">
import { Chart as highcharts } from "highcharts-vue";
</script>

<template>
  <h1>Graph</h1>
  <highcharts
    :options="{
      chart: {
        type: 'area', // Basic area chart
      },
      xAxis: {
        title: {
          text: 'Years',
        },
        //categories: ['Apples', 'Bananas', 'Oranges'],
      },
      yAxis: {
        title: {
          text: 'Capital accumulation',
        },
      },
      series: [
        {
          data: [1, 2, 3], // sample data
        },
      ],
    }"
  ></highcharts>
</template>

<style scoped></style>
