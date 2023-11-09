<script setup lang="ts">
import { Chart as highcharts } from "highcharts-vue";
</script>

<template>
  <h1>Graph</h1>
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
          text: 'Capital accumulation',
        },
        labels: {
          formatter: function () {
            return this.value;
          },
        },
      },
      series: [
        {
          name: '',
          data: [
            0, 2400, 4824, 7272.24, 9744.9624, 12242.412024000001,
            14764.836144240002, 17312.4845056824,
          ], // sample data
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
