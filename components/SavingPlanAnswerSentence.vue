<script setup lang="ts">

export interface Output{
    capitalAmount: number,
    savingRate: number,
    startInvestment: number,
    interestRate: number,
    end: string,
}

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
}>()

const formattedOutput = reactive({
    capitalAmount: 0,
    savingRate: 0,
    startInvestment: 0,
    interestRate: 0,
    end: '',
})

let isActive = [false, false, false, false, false];

function formattingOutput(unformattedOutput: Output){
    formattedOutput.capitalAmount = unformattedOutput.capitalAmount *0.01;
    formattedOutput.savingRate = unformattedOutput.savingRate *0.01;
    formattedOutput.startInvestment = unformattedOutput.startInvestment *0.01;
    formattedOutput.interestRate = unformattedOutput.interestRate *100;
    formattedOutput.end = formatDate(unformattedOutput.end)

}

function formatDate(inputDateStr: string) {
  // Parse the input date
  const inputDate = new Date(inputDateStr);

  // Extract day, month, and year
  const day = inputDate.getDate();
  const month = inputDate.getMonth() + 1; // Month is zero-based, so add 1
  const year = inputDate.getFullYear();

  // Create the formatted date string
  return `${day  < 10 ? '0' : ''}${day}/${month < 10 ? '0' : ''}${month}/${year}`;
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
    formattingOutput(props.output)
    highlightSetence(props.endpoint)

})

watch(()=>props.endpoint, ()=>{
    formattingOutput(props.output)
    isActive.forEach((item, i)=>{isActive[i] = false})
    highlightSetence(props.endpoint)
})

</script>
<template>
    <div>
        Wenn sie monatlich 
        <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[0]}">{{ formattedOutput.savingRate }} {{ currency }}</span>
         zu einem Zinssatz von 
         <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[1]}">{{ formattedOutput.interestRate }}%</span>
         sparen und mit einem Startkapital in Höhe von 
         <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[2]}">{{ formattedOutput.startInvestment }} {{ currency }}</span>
        beginnen, haben sie am 
        <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[3]}">{{ formattedOutput.end }} </span>
        ein Endkapital von 
        <span :class="{'font-weight-bold bg-orange-lighten-1': isActive[4]}">{{ formattedOutput.capitalAmount }} {{ currency }}</span>
    </div>
</template>

<style scoped>

</style>