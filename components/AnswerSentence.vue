<script setup lang="ts">

export interface Output{
    capitalAmount: number,
    savingRate: number,
    startInvestment: number,
    interestRate: number,
    end: string,
}
const years:number = ref(7)

const props = defineProps<{
 output:{
    capitalAmount: number,
    savingRate: number,
    startInvestment: number,
    interestRate: number,
    end: string,
 },
 currency: string,
 endpoint: string,
 scenario: string,
 startDate: string,
 seperator: string
}>()

const formattedOutput = reactive({
    capitalAmount: '',
    savingRate: 0,
    startInvestment: 0,
    interestRate: 0,
    end: '',
})

let isActive=[false, false, false, false, false];

function calculateTimeDifference(dateString1, dateString2) {
  const date1 = new Date(dateString1);
  const date2 = new Date(dateString2);

  const timeDifference = Math.abs(date2 - date1);

  const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25; // Considering leap years
  const yearsDifference = timeDifference / millisecondsInYear;

  return Math.round(yearsDifference);
}

function formatOutput(output:Output){
    formattedOutput.savingRate = output.savingRate > 0 ? addThousandSeparator(props.output.savingRate, props.seperator) : addThousandSeparator(props.output.savingRate *-1, props.seperator);
    formattedOutput.capitalAmount = addThousandSeparator(output.capitalAmount, props.seperator);
    formattedOutput.startInvestment = addThousandSeparator(output.startInvestment, props.seperator);
    formattedOutput.interestRate = output.interestRate
    formattedOutput.end = formatDate(output.end)
}

function formatDate(inputDateStr: string) {
  // Parse the input date
  const inputDate = new Date(inputDateStr);

  // Extract day, month, and year
  const day = inputDate.getDate();
  const month = inputDate.getMonth() + 1; // Month is zero-based, so add 1
  const year = inputDate.getFullYear();

  // Create the formatted date string
  return `${day  < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year}`;
}

function addThousandSeparator(amount:number, separator:string) {
  // Convert the number to a string and split the integer and decimal parts
  if (typeof amount == 'undefined') {
    return 0;
  }else
  {
    const parts = amount.toString().split('.');
    // Add thousand separators to the integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);

    // Join the integer and decimal parts with the separator if the number has a decimal part
    return  parts.join('.');

  }

}

function highlightSetence(endpoint: string){
    switch (props.endpoint){
        case 'saving-rate':{
            isActive[0]= true;
          break;
        }
        case 'interest-rate':{
            isActive[1]= true;
            break;
        }
        case 'saving-start-value':{
            isActive[2]= true;
            break;
        }
        case 'end-date':{
            isActive[3]= true;
            break;
        }
        case 'capital':{
            isActive[4]= true;
            break;
        }
    }
}

onMounted(()=>{
    formatOutput(props.output)
    highlightSetence(props.endpoint)
    years.value=calculateTimeDifference(props.startDate, props.output.end)
})

watch(()=>props.endpoint, ()=>{
    isActive.forEach((item, i)=>{isActive[i] = false})
    highlightSetence(props.endpoint)
    years.value=calculateTimeDifference(props.startDate, props.output.end)
})

watch(()=>props.output, ()=>{
    formatOutput(props.output)
    highlightSetence(props.endpoint)
    years.value=calculateTimeDifference(props.startDate, props.output.end)
})

</script>
<template>
    <div class="px-5">
      <h4 class="flex justify-center pt-5 pb-3 font-bold">{{ $t('answersentence.headline') }}</h4>
        <div v-if="scenario == 'saving'">

        <div v-if="isActive[0]" class="text-center">            
            {{ $t('answersentence.savingplan.saving-rate-1') }}<br>
            <span class="font-weight-bold"> {{ $t('answersentence.savingplan.saving-rate-2') }} {{ formattedOutput.savingRate }} {{ currency }} {{ $t('answersentence.savingplan.saving-rate-3')}}</span>.
        </div>

        <div v-if="isActive[1]" class="text-center">            
            {{ $t('answersentence.savingplan.interest-rate-1') }}<br>
            <span class="font-weight-bold"> {{ $t('answersentence.savingplan.interest-rate-2') }} {{ formattedOutput.interestRate }}% {{ $t('answersentence.savingplan.interest-rate-3') }}</span>.
        </div>

        <div v-if="isActive[2]" class="text-center">            
            {{ $t('answersentence.savingplan.saving-start-value-1') }}<br>
            <span class="font-weight-bold"> {{ $t('answersentence.savingplan.saving-start-value-2') }} {{ formattedOutput.startInvestment }} {{ currency }} {{ $t('answersentence.savingplan.saving-start-value-3') }}</span>.
        </div>

        <div v-if="isActive[3]" class="text-center">            
            {{ $t('answersentence.savingplan.end-date-1') }}<br>
            <span class="font-weight-bold"> {{ $t('answersentence.savingplan.end-date-2') }} {{ years }} {{ $t('answersentence.savingplan.end-date-3') }}</span> ({{ formattedOutput.end }}) <span class="font-weight-bold"> {{ $t('answersentence.savingplan.end-date-4') }}</span>.
        </div>

        <div v-if="isActive[4]" class="text-center">
            {{ $t('answersentence.savingplan.capital-1') }}<br>
            <span class="font-weight-bold"> {{ $t('answersentence.savingplan.capital-2') }} {{ formattedOutput.capitalAmount }} {{ currency }}</span>.
        </div>
    </div>


    <div v-if="scenario =='withdraw'">
        <div v-if="isActive[0]" class="text-center">            
            {{ $t('answersentence.withdrawplan.saving-rate-1') }}<br>
            <span class="font-weight-bold"> {{ $t('answersentence.withdrawplan.saving-rate-2') }} {{ formattedOutput.savingRate }} {{ currency }} {{ $t('answersentence.withdrawplan.saving-rate-3') }}</span>.
        </div>

        <div v-if="isActive[1]" class="text-center">            
            {{ $t('answersentence.withdrawplan.interest-rate-1') }}<br>
            <span class="font-weight-bold"> {{ $t('answersentence.withdrawplan.interest-rate-2') }} {{ formattedOutput.interestRate }}% {{ $t('answersentence.withdrawplan.interest-rate-3') }}</span>.
        </div>

        <div v-if="isActive[2]" class="text-center">            
            {{ $t('answersentence.withdrawplan.saving-start-value-1') }}<br>
            <span class="font-weight-bold"> {{ $t('answersentence.withdrawplan.saving-start-value-2') }} {{ formattedOutput.startInvestment }} {{ currency }} {{ $t('answersentence.withdrawplan.saving-start-value-3') }}</span>.
        </div>

        <div v-if="isActive[3]" class="text-center">            
            {{ $t('answersentence.withdrawplan.end-date-1') }} <br>
            <span class="font-weight-bold"> {{ $t('answersentence.withdrawplan.end-date-2') }} {{ years }} {{ $t('answersentence.withdrawplan.end-date-3') }}</span> ({{ formattedOutput.end }}) <span class="font-weight-bold"> {{ $t('answersentence.withdrawplan.end-date-4') }}</span>.
        </div>

        <div v-if="isActive[4]" class="text-center">
            {{ $t('answersentence.withdrawplan.capital-1') }} <br>
            <span class="font-weight-bold"> {{ $t('answersentence.withdrawplan.capital-2') }} {{ formattedOutput.capitalAmount }} {{ currency }}</span>.
        </div>


    </div>
    </div>
</template>

<style scoped>
.fs-12{
    font-size: 1.2em;
}
</style>
