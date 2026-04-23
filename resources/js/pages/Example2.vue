<template>
    <div>
        <h1>Example Page</h1>
        <button @click="handleStore">Store</button>
        <button @click="handleUpdate">Update</button>
    </div>
</template>

<script setup>

const { data, error } = await $getprops(
    {
        action: 'get_data',
    },
    true,
);
</script>
