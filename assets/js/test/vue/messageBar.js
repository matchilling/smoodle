import messageBar from '../../vue/messageBar.vue'
import BootstrapVue from 'bootstrap-vue'

import {
	createLocalVue,
	shallowMount
} from '@vue/test-utils'

const localVue = createLocalVue();
localVue.use(BootstrapVue)

const MESSAGE = "I'm a message"
const VARIANT = 'danger'
const SECONDS = 10

describe('messageBar', () => {

	let wrapper
	let alert

	describe('without countdown', () => {

		beforeEach((done) => {

			wrapper = shallowMount(messageBar, {
				localVue,
				propsData: {
					seconds: 0,
					variant: VARIANT
				}
			})

			wrapper.vm.show(MESSAGE)

			setTimeout(done, 0)
		})

		it('shows a permanent dismissable message', () => {
			alert = wrapper.find('b-alert-stub')

			expect(alert.attributes('show')).toBe('true')
			expect(alert.attributes('dismissible')).toBeTruthy()
			expect(alert.attributes('variant')).toBe(VARIANT)
			expect(alert.text()).toBe(MESSAGE)
		})
	})

	describe('with countdown', () => {

		beforeEach((done) => {

			wrapper = shallowMount(messageBar, {
				localVue,
				propsData: {
					seconds: SECONDS,
					variant: VARIANT
				}
			})

			wrapper.vm.show(MESSAGE)

			setTimeout(done, 0)
		})

		it('shows a message with countdown', () => {
			alert = wrapper.find('b-alert-stub')

			expect(alert.attributes('show')).toEqual(SECONDS.toString())
			expect(alert.attributes('dismissible')).toBeFalsy()
			expect(alert.attributes('variant')).toBe(VARIANT)
			expect(alert.text()).toBe(MESSAGE)
		})
	})
})
