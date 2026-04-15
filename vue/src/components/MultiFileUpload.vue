<template>
  <div class="space-y-3">
    <div
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="[
        'relative border-2 border-dashed rounded-2xl p-6 transition-all text-center',
        isDragging ? 'border-[var(--accent-1)] bg-[var(--accent-1)]/5' : 'border-slate-200 hover:border-slate-300'
      ]"
    >
      <input
        type="file"
        multiple
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        @change="handleFileSelect"
      />
      <div class="space-y-2">
        <div class="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto text-slate-400">
          <Upload class="w-6 h-6" />
        </div>
        <div>
          <p class="text-sm font-bold text-slate-700">Click or drag files to upload</p>
          <p class="text-xs text-slate-400">PDF, JPG, PNG up to 10MB each</p>
        </div>
      </div>
    </div>

    <!-- File List -->
    <div v-if="files.length > 0" class="space-y-2">
      <div
        v-for="(file, index) in files"
        :key="index"
        class="flex items-center justify-between p-3 bg-slate-50 rounded-xl group"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 flex-shrink-0">
            <FileText v-if="isPdf(file.name)" class="w-4 h-4" />
            <ImageIcon v-else class="w-4 h-4" />
          </div>
          <div class="min-w-0">
            <p class="text-xs font-bold text-slate-700 truncate">{{ file.name }}</p>
            <p class="text-[10px] text-slate-400">{{ formatSize(file.size) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="file.uploading" class="text-[10px] font-bold text-indigo-500 animate-pulse">Uploading...</span>
          <span v-else-if="file.error" class="text-[10px] font-bold text-rose-500">Failed</span>
          <span v-else-if="file.uploaded" class="text-[10px] font-bold text-emerald-500">Ready</span>
          <button
            @click.stop="removeFile(index)"
            class="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Upload, FileText, Image as ImageIcon, X } from 'lucide-vue-next'
import { filesAPI } from '../services/api'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  module: {
    type: String,
    default: 'General'
  },
  recordId: {
    type: [String, Number],
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const files = ref([])
const isDragging = ref(false)

// Initial Load: Fetch existing attachments if recordId is provided
if (props.recordId) {
  filesAPI.getAttachments(props.module, props.recordId).then(res => {
    if (res.data?.success) {
      files.value = res.data.files.map(f => ({
        ...f,
        name: f.fileName,
        uploaded: true,
        uploading: false
      }))
    }
  })
}

// Sync with parent when files change
watch(files, (newFiles) => {
  const uploaded = newFiles.filter(f => f.uploaded && !f.uploading).map(f => ({
    fileId: f.fileId,
    fileName: f.name,
    url: f.url
  }))
  emit('update:modelValue', uploaded)
}, { deep: true })

function handleFileSelect(e) {
  const selectedFiles = Array.from(e.target.files)
  addFiles(selectedFiles)
}

function handleDrop(e) {
  isDragging.value = false
  const droppedFiles = Array.from(e.dataTransfer.files)
  addFiles(droppedFiles)
}

async function addFiles(newFiles) {
  for (const file of newFiles) {
    const fileObj = {
      name: file.name,
      size: file.size,
      uploading: true,
      uploaded: false,
      error: false,
      rawFile: file
    }
    files.value.push(fileObj)
    const index = files.value.length - 1

    try {
      const formData = new FormData()
      formData.append('files', file)
      formData.append('module', props.module)
      formData.append('recordId', props.recordId)
      
      const res = await filesAPI.upload(formData)
      if (res.data?.success && res.data.files?.length > 0) {
        const uploaded = res.data.files[0]
        files.value[index] = {
          ...fileObj,
          uploading: false,
          uploaded: true,
          fileId: uploaded.fileId,
          url: uploaded.url
        }
      } else {
        throw new Error('Upload failed')
      }
    } catch (err) {
      console.error('File upload error:', err)
      files.value[index].uploading = false
      files.value[index].error = true
    }
  }
}

function removeFile(index) {
  files.value.splice(index, 1)
}

function formatSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function isPdf(name) {
  return name?.toLowerCase().endsWith('.pdf')
}
</script>
