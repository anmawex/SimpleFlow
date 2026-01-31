<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { defineEmits, defineProps, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
    title: { type: String, default: 'Management' },
    items: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    columns: { type: Array, default: () => [] }, // [{field, header, sortable, type, style}]
    entityName: { type: String, default: 'Item' },
    displayField: { type: String, default: 'name' }, // Campo a mostrar en dialogos de confirmación (ej. name, title, id)
    showEdit: { type: Boolean, default: true },
    showDelete: { type: Boolean, default: true },
    manualClose: { type: Boolean, default: false },
    confirmDeleteMessage: { type: [String, Function], default: null }, // Opcional: mensaje personalizado
    confirmDeleteSelectedMessage: { type: [String, Function], default: null } // Opcional: mensaje personalizado
});

const emit = defineEmits(['save', 'delete', 'delete-selected']);

const toast = useToast();
const dt = ref();
const itemDialog = ref(false);
const deleteItemDialog = ref(false);
const deleteUtilsDialog = ref(false);
const item = ref({});
const selectedItems = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

// Funciones para abrir/cerrar diálogos
function openNew() {
    item.value = {};
    submitted.value = false;
    itemDialog.value = true;
}

function hideDialog() {
    itemDialog.value = false;
    submitted.value = false;
}

function editItem(data) {
    item.value = { ...data };
    itemDialog.value = true;
}

function confirmDeleteItem(data) {
    item.value = data;
    deleteItemDialog.value = true;
}

function deleteItem() {
    emit('delete', item.value);
    deleteItemDialog.value = false;
    item.value = {};
    toast.add({ severity: 'success', summary: t('common.successful'), detail: t('common.deleted'), life: 3000 });
}

function saveItem() {
    submitted.value = true;
    
    if (props.manualClose) {
        // En modo manual, pasamos una función callback para que el padre cierre cuando termine
        const payload = { 
            ...item.value, 
            _closeDialog: () => { 
                itemDialog.value = false; 
                submitted.value = false; 
            }
        };
        emit('save', payload);
    } else {
        // Comportamiento default (App antigua)
        emit('save', item.value);
        itemDialog.value = false;
        submitted.value = false;
    }
}

function confirmDeleteSelected() {
    deleteUtilsDialog.value = true;
}

function deleteSelectedItems() {
    emit('delete-selected', selectedItems.value);
    deleteUtilsDialog.value = false;
    selectedItems.value = null;
    toast.add({ severity: 'success', summary: t('common.successful'), detail: t('common.deleted_selected'), life: 3000 });
}

function exportCSV() {
    dt.value.exportCSV();
}
</script>

<template>
    <div>
        <div class="card">
            <!-- Toolbar -->
            <Toolbar class="mb-6">
                <template #start>
                    <Button :label="$t('common.new')" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    <Button :label="$t('common.delete')" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedItems || !selectedItems.length" />
                </template>

                <template #end>
                    <Button :label="$t('common.export')" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <!-- DataTable -->
            <DataTable
                ref="dt"
                v-model:selection="selectedItems"
                :value="items"
                :loading="loading"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                :currentPageReportTemplate="$t('common.showing')"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">{{ title }}</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" :placeholder="$t('common.search')" />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                
                <!-- Dynamic Columns -->
                <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" :sortable="col.sortable !== false" :style="col.style">
                    
                    <!-- 1. Custom Slot (Highest Priority) -->
                     <template #body="slotProps" v-if="$slots[`col-${col.field}`]">
                         <slot :name="`col-${col.field}`" :data="slotProps.data"></slot>
                    </template>

                    <!-- 2. Currency Type -->
                    <template #body="slotProps" v-else-if="col.type === 'currency'">
                        {{ slotProps.data[col.field]?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}
                    </template>

                    <!-- 3. Text/Default (Fallback) -->
                    <template #body="slotProps" v-else>
                         {{ slotProps.data[col.field] }}
                    </template>
                </Column>

                <!-- Actions Column -->
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <slot name="actions-start" :data="slotProps.data"></slot>
                        <Button v-if="showEdit" icon="pi pi-pencil" outlined rounded class="mr-2" @click="editItem(slotProps.data)" />
                        <Button v-if="showDelete" icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteItem(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Edit Dialog -->
        <Dialog v-model:visible="itemDialog" :style="{ width: '900px', maxWidth: '90vw' }" :header="$t('common.details', { entity: entityName })" :modal="true" class="p-fluid">
            <div class="flex flex-col gap-6">
                <!-- Slot para el formulario específico -->
                <slot name="form" :item="item" :submitted="submitted"></slot>
            </div>

            <template #footer>
                <Button :label="$t('common.cancel')" icon="pi pi-times" text @click="hideDialog" />
                <Button :label="$t('common.save')" icon="pi pi-check" @click="saveItem" />
            </template>
        </Dialog>

        <!-- Delete Dialog -->
        <Dialog v-model:visible="deleteItemDialog" :style="{ width: '450px' }" :header="$t('common.confirm')" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl!" />
                <span v-if="item">
                    <span v-if="confirmDeleteMessage">
                        <span v-if="typeof confirmDeleteMessage === 'function'" v-html="confirmDeleteMessage(item)"></span>
                        <span v-else v-html="confirmDeleteMessage"></span>
                    </span>
                    <span v-else>Are you sure you want to delete <b>{{ item[displayField] }}</b>?</span>
                </span>
            </div>
            <template #footer>
                <Button :label="$t('common.no')" icon="pi pi-times" text @click="deleteItemDialog = false" />
                <Button :label="$t('common.yes')" icon="pi pi-check" @click="deleteItem" />
            </template>
        </Dialog>

        <!-- Delete Selected Dialog -->
        <Dialog v-model:visible="deleteUtilsDialog" :style="{ width: '450px' }" :header="$t('common.confirm')" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl!" />
                <span>
                    <span v-if="confirmDeleteSelectedMessage">
                        <span v-if="typeof confirmDeleteSelectedMessage === 'function'" v-html="confirmDeleteSelectedMessage(selectedItems)"></span>
                        <span v-else v-html="confirmDeleteSelectedMessage"></span>
                    </span>
                    <span v-else>Are you sure you want to delete the selected items?</span>
                </span>
            </div>
            <template #footer>
                <Button :label="$t('common.no')" icon="pi pi-times" text @click="deleteUtilsDialog = false" />
                <Button :label="$t('common.yes')" icon="pi pi-check" text @click="deleteSelectedItems" />
            </template>
        </Dialog>
    </div>
</template>
