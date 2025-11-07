<script setup lang="ts">
import { ref } from 'vue';
import { Map, User } from 'lucide-vue-next';
import { useToast } from 'primevue/usetoast';
import { Button, InputGroup, InputGroupAddon, InputText, Fieldset, InputNumber, Select } from "primevue"
import { Form } from '@primevue/forms';
import Card from "./Card.vue"
import DummyForm from "./Form.vue"

const toast = useToast();

const initialValues = ref({
    username: ''
});

const resolver = ({ values }) => {
    const errors = { username: [] };

    if (!values.username) {
        errors.username.push({ type: 'required', message: 'Username is required.' });
    }

    if (values.username?.length < 3) {
        errors.username.push({ type: 'minimum', message: 'Username must be at least 3 characters long.' });
    }

    return {
        values,
        errors
    };
};

const onFormSubmit = ({ valid }) => {
    if (valid) {
        toast.add({ severity: 'success', summary: 'Form is submitted.', life: 3000 });
    }
}

const text1 = ref(null);
const text2 = ref(null);
const number = ref(null);
const selectedCity = ref();
const cities = ref([
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
]);
</script>

<template>
    <div class="demo">
        <h1 class="text-3xl mb-8 text-center">Demo: PrimeVue</h1>

        <div class="flex flex-row items-start gap-8">
            <div class="flex-none card grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup>
                    <InputGroupAddon>
                        <User />
                    </InputGroupAddon>
                    <InputText v-model="text1" placeholder="Username" />
                </InputGroup>

                <InputGroup>
                    <InputGroupAddon>$</InputGroupAddon>
                    <InputNumber v-model="number" placeholder="Price" />
                    <InputGroupAddon>.00</InputGroupAddon>
                </InputGroup>

                <InputGroup>
                    <InputGroupAddon>www</InputGroupAddon>
                    <InputText v-model="text2" placeholder="Website" />
                </InputGroup>

                <InputGroup>
                    <InputGroupAddon>
                        <Map />
                    </InputGroupAddon>
                    <Select v-model="selectedCity" :options="cities" optionLabel="name" placeholder="City" />
                </InputGroup>
            </div>

            <Card class="w-[460px]!" />
        </div>

        <div class="card flex justify-center">

            <Form v-slot="$form" :initialValues :resolver @submit="onFormSubmit"
                class="grid lg:grid-cols-2 gap-4 w-full">
                <div class="flex flex-col justify-center items-center gap-4">
                    <InputText name="username" type="text" placeholder="Username" class="w-full sm:w-56" />
                    <Button type="submit" severity="secondary" label="Submit" class="w-full sm:w-56" />
                </div>
                <Fieldset legend="Form States" class="h-80 overflow-auto">
                    <pre class="whitespace-pre-wrap">{{ $form }}</pre>
                </Fieldset>
            </Form>
        </div>

        <hr class="my-8">

        <DummyForm />

        <hr class="my-8">

        <Button label="Click Me" class="bg-blue-500" />
    </div>
</template>

<style lang="scss" scoped>
// .p-button {
//     background-color: var(--primary);
// }</style>