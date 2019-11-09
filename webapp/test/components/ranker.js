import ranker from '../../src/components/ranker.vue'
import PrettyCheckbox from 'pretty-checkbox-vue'

import {
	mount,
	createLocalVue
} from '@vue/test-utils'

const localVue = createLocalVue()
localVue.use(PrettyCheckbox)

const ELEMENTS = [{
	name: 'ABC',
	value: 1
}, {
	name: 'DEF',
	value: -1
}, {
	name: 'GHI',
	value: 1,
	disabled: true
}]

const ELEMENTS_BOOLEAN = [{
	name: 'ABC',
	value: true
}, {
	name: 'DEF',
	value: false
}, {
	name: 'GHI',
	value: true,
	disabled: true
}]

function mountRanker(boolean) {

	return mount(ranker, {
		mocks: {
			$t: (k) => k
		},
		propsData: {
			elements: boolean ? ELEMENTS_BOOLEAN : ELEMENTS,
			boolean
		},
		localVue
	})
}

describe('ranker', () => {

	let wrapper

	describe('in non-boolean mode', () => {

		beforeEach(() => {
			wrapper = mountRanker(false)
		})

		it('renders the right number of elements', () => {
			let elements = wrapper.findAll('li')
			expect(elements.length).toBe(ELEMENTS.length)
		})

		it('renders the right elements in the right order', () => {
			let elements = wrapper.findAll('li')

			ELEMENTS.forEach((el, index) => {
				let element = elements.at(index)

				expect(element.find('h6').text()).toBe(el.name)

				let radios = element.findAll('input[type="radio"]')
				expect(radios.at(0).attributes('name')).toBe(el.name)
				expect(radios.at(0).attributes('value')).toBe(el.disabled ? '' : "1")
				expect(radios.at(0).attributes('disabled')).toBe(el.disabled ? 'disabled' : undefined)

				expect(radios.at(1).attributes('name')).toBe(el.name)
				expect(radios.at(1).attributes('value')).toBe(el.disabled ? '' : "0")
				expect(radios.at(1).attributes('disabled')).toBe(el.disabled ? 'disabled' : undefined)

				expect(radios.at(2).attributes('name')).toBe(el.name)
				expect(radios.at(2).attributes('value')).toBe(el.disabled ? '' : "-1")
				expect(radios.at(2).attributes('disabled')).toBe(el.disabled ? 'disabled' : undefined)
			})
		})

		it('propagates change events', () => {

			let elements = wrapper.findAll('li')

			ELEMENTS.forEach((el, index) => {
				let element = elements.at(index)

				let radios = element.findAll('input[type="radio"]')
				radios.at(0).trigger('change')
				radios.at(1).trigger('change')
				radios.at(2).trigger('change')
			})

			expect(wrapper.emitted().change.length).toBe(2 * 3)
		})
	})

	describe('in boolean mode', () => {

		beforeEach(() => {
			wrapper = mountRanker(true)
		})

		it('renders the right number of elements', () => {
			let elements = wrapper.findAll('li')
			expect(elements.length).toBe(ELEMENTS.length)
		})

		it('renders the right elements in the right order', () => {
			let elements = wrapper.findAll('li')

			ELEMENTS_BOOLEAN.forEach((el, index) => {
				let element = elements.at(index)

				expect(element.find('h6').text()).toBe(el.name)

				let toggle = element.findAll('input[type="checkbox"]')
				expect(toggle.length).toBe(1)
				expect(toggle.at(0).attributes('disabled')).toBe(el.disabled ? 'disabled' : undefined)
			})
		})

		it('propagates change events', () => {

			let elements = wrapper.findAll('li')

			ELEMENTS_BOOLEAN.forEach((el, index) => {
				let element = elements.at(index)

				let toggle = element.findAll('input[type="checkbox"]')
				toggle.at(0).trigger('change')
			})

			expect(wrapper.emitted().change.length).toBe(2)
		})
	})
})