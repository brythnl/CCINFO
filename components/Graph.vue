<script setup lang="ts">
import { Chart as highcharts } from "highcharts-vue";

const props = defineProps(["series", "result"]);
const maxYAxis = ref(props.result.capitalAmount); // The maximum value of the Y Axis
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

watch(
  () => props,
  (newValue, oldValue) => {
    // Control the range of the y axis
    if (newValue.result.capitalAmount > maxYAxis.value)
      maxYAxis.value = newValue.result.capitalAmount;
    yearsToSeries.value = assignYearsToSeries(newValue.series, newValue.result);
  },
  { deep: true }
);
</script>

<template>
  <highcharts
    class="mt-5 text-sm"
    :options="{
      chart: {
        type: 'area', // Basic area chart
        lang: {
          numericSymbols: null, //otherwise by default ['k', 'M', 'G', 'T', 'P', 'E']
        },
      },
      title: {
        text: 'Capital accumulation',
        style: {
          fontSize: 'inherit',
        },
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
        // visible: false,        // Don't show the Y Axis
        max: maxYAxis,
        title: {
          text: 'Capital',
        },
        labels: {
          formatter: function () {
            return this.value.toLocaleString('en') + ' €'; // TODO: The Currency should be variable and the 1000 seperators also (Change 'en' <-> 'de')
          },
        },
      },
      series: [
        {
          showInLegend: false,
          data: yearsToSeries,
          color: '#4195ac',
        },
      ],
      tooltip: {
        formatter: function () {
          return `In ${new Date(
            this.x
          ).getFullYear()} there would be a capital of ${Math.round(this.y)}€`;
        },
      },
    }"
  ></highcharts>
</template>

<style scoped></style>
