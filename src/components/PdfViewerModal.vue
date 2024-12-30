<template>
    <ion-modal 
      :breakpoints="[1]"  
      :is-open="isOpen"
      @didDismiss="closeModal"
      :swipe-to-close="false"
      :backdropDismiss="false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ adType }} for {{ formattedStartDate }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeModal">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div>
          <div class="pdf-controls">
            <ion-button shape="round" fill="outline" size="small"
              :disabled="currentPage === 1"
              @click="handlePreviousPage"
            >
              <ion-icon :icon="chevronBackOutline"></ion-icon>
            </ion-button>
            
            <div class="pdf-pagination">
              Page {{ currentPage }} of {{ totalPages }}
            </div>
            
            <ion-button shape="round" fill="outline" size="small"
              :disabled="currentPage === totalPages"
              @click="handleNextPage"
            >
              <ion-icon :icon="chevronForwardOutline"></ion-icon>
            </ion-button>
          </div>
        </div>
  
        <div ref="pdfContainer" class="pdf-container"></div>
      </ion-content>
    </ion-modal>
  </template>
  
  <script setup>
  import { ref, nextTick, watch, onMounted, computed } from 'vue';
  import usePdfViewer from '../composables/usePdfViewer';
  import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
  
  const props = defineProps({
    isOpen: Boolean,
    pdfUrl: String,
    adType: {
      type: String,
      default: 'Ad'
    },
    startDate: {
      type: String,
      default: ''
    }
  });
  
  const emit = defineEmits(['update:isOpen']);
  
  const pdfContainer = ref(null);
  
  const {
    currentPage,
    totalPages,
    loadPdf,
    initPdfViewer,
    nextPage,
    previousPage
  } = usePdfViewer();
  
  // Update the date formatting to MM/DD format
  const formattedStartDate = computed(() => {
    if (!props.startDate) return '';
    const date = new Date(props.startDate);
    return `${date.getMonth() + 1}/${date.getDate()}`; // This will show format like "1/1" or "12/31"
  });
  
  const closeModal = () => {
    emit('update:isOpen', false);
  };
  
  const handleNextPage = async () => {
    if (pdfContainer.value) {
      await nextPage(pdfContainer.value);
    }
  };
  
  const handlePreviousPage = async () => {
    if (pdfContainer.value) {
      await previousPage(pdfContainer.value);
    }
  };
  
  watch(() => props.isOpen, async (newVal) => {
    if (newVal && props.pdfUrl) {
      await nextTick();
      if (pdfContainer.value) {
        await loadPdf(props.pdfUrl, pdfContainer.value);
      }
    }
  });
  
  onMounted(() => {
    initPdfViewer();
  });
  </script>
  
  <style scoped>
  .pdf-controls {
    padding: 20px 8px 20px;
    background: #ffffff !important;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .pdf-container {
    width: 100%;
    height: 100%;
  }
  
  .pdf-pagination {
    flex: 1;
    text-align: center;
    font-size: 14px;
    color: var(--ion-color-medium);
  }
  </style>