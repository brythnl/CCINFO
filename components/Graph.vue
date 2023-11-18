<script setup lang="ts">
import { Chart as highcharts } from "highcharts-vue";

const props = defineProps(["series", "result"]);

const assignYearsToSeries = () => {
  const seriesCount = props.series.length; // Length of the series
  const endYear = new Date(props.result.end).getFullYear();

  // Calculate the appropriate year 0f the series entry
  let appropriateYear = endYear - seriesCount;

  //Save the Start investment
  const startInvestment = [
    Date.UTC(appropriateYear++),
    props.result.startInvestment,
  ];

  const preparedSeries = props.series.map((element: number) => {
    // Push the series entries to an individual array
    const arr = new Array();
    arr.push(element);

    // Push the appropriate date before the previous entry
    arr.unshift(Date.UTC(appropriateYear++));

    return arr;
  });

  // Put the start investemnt at the beginning of the preparedSeries arrays
  preparedSeries.unshift(startInvestment);

  return preparedSeries;
};

onMounted(() => {
  assignYearsToSeries();
});

watch(props, (newValue, oldValue) => {
  assignYearsToSeries();
});
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
      title: {
        text: 'Capital accumulation',
      },

      xAxis: {
        type: 'datetime',
        labels: {
          format: '{value:%Y}', // Fromat the year display
        },
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
          showInLegend: false,
          data: assignYearsToSeries(),
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
