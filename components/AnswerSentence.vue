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
 scenario: number,
 startDate: string
}>()

const formattedOutput = reactive({
    capitalAmount: 0,
    savingRate: 0,
    startInvestment: 0,
    interestRate: 0,
    end: '',
})

let isActive = [false, false, false, false, false];

function calculateTimeDifference(dateString1, dateString2) {
  const date1 = new Date(dateString1);
  const date2 = new Date(dateString2);

  const timeDifference = Math.abs(date2 - date1);

  const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25; // Considering leap years
  const yearsDifference = timeDifference / millisecondsInYear;

  return Math.floor(yearsDifference);
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
    highlightSetence(props.endpoint)
    years.value=calculateTimeDifference(props.startDate, props.output.end)
})

watch(()=>props.endpoint, ()=>{
    isActive.forEach((item, i)=>{isActive[i] = false})
    highlightSetence(props.endpoint)
    years.value=calculateTimeDifference(props.startDate, props.output.end)
})

watch(()=>props.output, ()=>{
    highlightSetence(props.endpoint)
    years.value=calculateTimeDifference(props.startDate, props.output.end)
})

</script>
<template>
    <div v-if="scenario == 0">
        <div v-if="isActive[0]">
            Wenn Sie monatlich
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[0]}">{{ output.savingRate }} {{ currency }}</span>
            zu 
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[1]}">{{ output.interestRate }}% Zinsen
            </span>
            über {{ years }} Jahre
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[3]}">({{ formatDate(output.end) }})</span>
            anlegen, kommen Sie auf ein Endkapital von 
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[4]}">{{ output.capitalAmount }} {{ currency }}</span>
            Sie investieren am {{ formatDate(startDate) }}
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[2]}">{{ output.startInvestment }} {{ currency }}</span>.
        </div>
    </div>

    <div v-if="scenario == 0">
        <div v-if="isActive[1]">
            Wenn Sie zu 
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[1]}">{{ output.interestRate }}% Zinsen</span>
            monatlich
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[0]}">{{ output.savingRate }} {{ currency }}</span>
            über {{ years }} Jahre
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[3]}">({{ formatDate(output.end) }})</span>
            anlegen, kommen Sie auf ein Endkapital von 
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[4]}">{{ output.capitalAmount }} {{ currency }}</span>
            Sie investieren am {{ formatDate(startDate) }}
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[2]}">{{ output.startInvestment }} {{ currency }}</span>.
        </div>
    </div>


    <div v-if="scenario == 0">
        <div v-if="isActive[2]">
            Sie müssen am {{ formatDate(startDate) }}
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[2]}">{{ output.startInvestment }} {{ currency }}</span> investieren.
            Wenn sie nun über  {{ years }} Jahre
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[3]}">({{ formatDate(output.end) }})</span>
            monatlich 
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[0]}">{{ output.savingRate }} {{ currency }}</span>
            zu 
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[1]}">{{ output.interestRate }}% Zinsen</span>
            anlegen, kommen Sie auf ein Endkapital von 
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[4]}">{{ output.capitalAmount }} {{ currency }}</span>
        </div>
    </div>

    <div v-if="scenario == 0">
        <div v-if="isActive[3]">
            Wenn sie über  {{ years }} Jahre 
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[3]}">({{ formatDate(output.end) }})</span>
            monatlich 
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[0]}">{{ output.savingRate }} {{ currency }}</span>
            zu 
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[1]}">{{ output.interestRate }}% Zinsen</span>
            anlegen, kommen Sie auf ein Endkapital von 
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[4]}">{{ output.capitalAmount }} {{ currency }}</span>
            Sie investieren am {{ formatDate(startDate) }}
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[2]}">{{ output.startInvestment }} {{ currency }}</span>.
        </div>
    </div>

    <div v-if="scenario == 0">
        <div v-if="isActive[4]">
            Sie kommen auf ein Endkapital von 
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[4]}">{{ output.capitalAmount }} {{ currency }}</span>
            , wenn Sie über {{ years }} Jahre
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[3]}">({{ formatDate(output.end) }})</span>
            monatlich
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[0]}">{{ output.savingRate }} {{ currency }}</span>
            zu 
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[1]}">{{ output.interestRate }}% Zinsen</span>
            anlegen und am 
            {{ formatDate(startDate) }}
            <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[2]}">{{ output.startInvestment }} {{ currency }}</span> investieren.
        </div>
    </div>

    <div v-if="scenario ==1">
        Sie haben am {{ formatDate(startDate) }} ein Vermögen von
        <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[2]}">{{ output.startInvestment }} {{ currency }}</span>.
        Von an entnehmen Sie jeden Monat
        <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[0]}">{{ output.savingRate }} {{ currency }}</span>
         zu 
         <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[1]}">{{ output.interestRate }}% Zinsen.</span>
          Dann haben sie nach X Jahren 
        <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[3]}">({{ output.end }})</span>
        noch
        <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[4]}">{{ output.capitalAmount }} {{ currency }} Ersparnisse.</span>
    </div>
</template>

<style scoped>

</style>
