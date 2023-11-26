<script setup lang="ts">
import { Chart as highcharts } from "highcharts-vue";

const props = defineProps(["series", "result"]);
const reactiveResult = ref(props.result);
const reactiveSeries = ref(props.series);
const maxYAxis = ref(500000); // The maximum value of the Y Axis
const yearsToSeries = ref([]);

const assignYearsToSeries = (series: [], result: {}) => {
  const seriesCount = series.length; // Length of the series
  const endYear = new Date(result.end).getFullYear();

  // Calculate the appropriate year 0f the series entry
  let appropriateYear = endYear - seriesCount;

  //Save the Start investment
  const startInvestment = [Date.UTC(appropriateYear++), result.startInvestment];

  const preparedSeries = series.map((element: number) => {
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
  yearsToSeries.value = assignYearsToSeries(props.series, props.result);
});

// TODO: props -> reactiveResult
watch(props, (newValue, oldValue) => {
  // Control the range of the y axis
  if (newValue.result.capitalAmount < oldValue.result.capitalAmount) {
    maxYAxis.value = oldValue.result.capitalAmount;
  } else maxYAxis.value = newValue.result.capitalAmount;

  //console.log(newValue.series);
  // TODO: HIER WEITER!!!
  yearsToSeries.value = assignYearsToSeries(newValue.series, newValue.result);
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
        max: maxYAxis,
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
          data: yearsToSeries,
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
