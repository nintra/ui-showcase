import { reactive } from 'vue'

// What the visitor picked so far (pricing card, preview style). Pre-fills the signup forms.
export const interest = reactive({
  package: '',
  style: '',
  dialogOpen: false,
  dialogLocation: '',
})

export function openSignup({ location, pkg } = {}) {
  if (pkg) interest.package = pkg
  interest.dialogLocation = location || 'dialog'
  interest.dialogOpen = true
}
