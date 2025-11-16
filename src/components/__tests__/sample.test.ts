
import { test, expect, describe } from "vitest";
import AppWelcome from "../AppWelcome.vue"
import PublishersList from "../PublishersList.vue";
import TemplateHolder from "../TemplateHolder.vue";
import AssignmentSlips from "../AssignmentSlips.vue";
import TemplateSettings from "../TemplateSettings.vue";
import AssignmentSelector from "../AssignmentSelector.vue";

describe('components truthyness', () => {

  test('welcome page should work', () => {
    expect(AppWelcome).toBeTruthy();
  })

  test('publishers list page should work', () => {
    expect(PublishersList).toBeTruthy();
  })

  test('mwb template holder page should work', () => {
    expect(TemplateHolder).toBeTruthy();
  })

  test('assignment slips template holder page should work', () => {
    expect(AssignmentSlips).toBeTruthy();
  })

  test('template settings modal should work', () => {
    expect(TemplateSettings).toBeTruthy();
  })

  test('assignment selector should work', () => {
    expect(AssignmentSelector).toBeTruthy();
  })

})
//   test('welcome message should display', () => {
//     setActivePinia(createPinia())
//     const wrapper = mount(AppWelcome)
//   expect(wrapper.text()).toContain('Welcome!')
// })