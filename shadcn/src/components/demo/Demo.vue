<script setup lang="ts">
import { ArrowUpIcon, CheckIcon, InfoIcon, PlusIcon, Search } from "lucide-vue-next"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { Button } from '@/components/ui/button'
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
    InputGroupTextarea
} from '@/components/ui/input-group'
import { Separator } from "@/components/ui/separator"
import { Input } from '@/components/ui/input'
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"


import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import Card from "@/components/demo/Card.vue"

const formSchema = toTypedSchema(z.object({
    username: z.string().min(2).max(50),
}))

const form = useForm({
    validationSchema: formSchema,
})

const onSubmit = form.handleSubmit((values) => {
    console.log('Form submitted!', values)
})
</script>

<template>
    <div>
        <h1 class="text-3xl mb-8 text-center">Demo: shadcn-vue</h1>
        <div class="flex gap-4">
            <div class="flex flex-col gap-4">

                <InputGroup>
                    <InputGroupInput placeholder="Search..." />
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                        12 results
                    </InputGroupAddon>
                </InputGroup>


                <InputGroup>
                    <InputGroupInput placeholder="example.com" class="!pl-1" />
                    <InputGroupAddon>
                        <InputGroupText>https://</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger as-child>
                                    <InputGroupButton class="rounded-full" size="icon-xs">
                                        <InfoIcon class="size-4" />
                                    </InputGroupButton>
                                </TooltipTrigger>
                                <TooltipContent>This is content in a tooltip.</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </InputGroupAddon>
                </InputGroup>

                <Separator />

                <FormField v-slot="{ componentField }" name="username">
                    <FormItem>
                        <FormLabel>E-Mail</FormLabel>
                        <InputGroup>
                            <InputGroupInput placeholder="@shadcn" v-bind="componentField" />
                            <InputGroupAddon align="inline-end">
                                <div
                                    class="flex items-center justify-center rounded-full bg-primary text-primary-foreground size-4">
                                    <CheckIcon class="size-3" />
                                </div>
                            </InputGroupAddon>
                        </InputGroup>
                    </FormItem>
                </FormField>
            </div>
            <Separator orientation="vertical" />

            <Card />
        </div>

        <div class="my-8" />

        <InputGroup>
            <InputGroupTextarea placeholder="Ask, Search or Chat..." />
            <InputGroupAddon align="block-end">
                <InputGroupButton variant="outline" class="rounded-full" size="icon-xs">
                    <PlusIcon class="size-4" />
                </InputGroupButton>
                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <InputGroupButton variant="ghost">
                            Auto
                        </InputGroupButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="start" class="[--radius:0.95rem]">
                        <DropdownMenuItem>Auto</DropdownMenuItem>
                        <DropdownMenuItem>Agent</DropdownMenuItem>
                        <DropdownMenuItem>Manual</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <InputGroupText class="ml-auto">
                    52% used
                </InputGroupText>
                <Separator orientation="vertical" class="!h-4" />
                <InputGroupButton variant="default" class="rounded-full" size="icon-xs" disabled>
                    <ArrowUpIcon class="size-4" />
                    <span class="sr-only">Send</span>
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>

        <div class="my-8" />

        <h3>Kontakt</h3>

        <form @submit="onSubmit">
            <FormField v-slot="{ componentField }" name="username">
                <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                        <Input type="text" placeholder="shadcn" v-bind="componentField" />
                    </FormControl>
                    <FormDescription>
                        This is your public display name.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
                <Button type="submit" class="mt-4">Submit</Button>
            </FormField>
        </form>
    </div>
</template>
