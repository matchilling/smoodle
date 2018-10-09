import eventViewer from '../../vue/eventViewer.vue'
import BootstrapVue from 'bootstrap-vue'
import VueClipboard from 'vue-clipboard2'
import {
	mount,
	createLocalVue
} from '@vue/test-utils'

const routerSpy = jasmine.createSpyObj("routerSpy", ["push"])

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(VueClipboard)

function mountEventViewer(restRequest, propsData) {

	const config = {
		mixins: [{
			methods: {
				restRequest
			}
		}],
		mocks: {
			$t: k => k,
			$tc: k => k,
			$i18n: {
				t: k => k
			},
			$router: routerSpy,
			$scrollTo: () => null
		},
		propsData,
		localVue
	}

	return mount(eventViewer, config)
}


const EVENT_ID = "bf6747d5-7b32-4bde-8e2d-c055d9bb02d3"
const EVENT_SECRET = "NGQ4NkdBQWVTd0U9"

const EVENT_DATA = {
	"updated_at": "2018-09-20T17:06:20.000000Z",
	"time_window_to": "2019-12-01",
	"time_window_from": "2019-06-01",
	"state": "OPEN",
	"share_link": "http://localhost:4000/events/bf6747d5-7b32-4bde-8e2d-c055d9bb02d3",
	"secret": EVENT_SECRET,
	"scheduled_to": null,
	"scheduled_from": null,
	"owner_link": "http://localhost:4000/events/bf6747d5-7b32-4bde-8e2d-c055d9bb02d3?s=NGQ4NkdBQWVTd0U9",
	"organizer": "Max",
	"name": "Party",
	"inserted_at": "2018-09-20T17:06:20.000000Z",
	"id": EVENT_ID,
	"email": "maxmarcon@gmx.net",
	"desc": "Be our guest!"
}

const SCHEDULE_DATA = {
	participants_count: 5,
	participants: [],
	dates: [{
		"positive_rank": 1,
		"negative_rank": 0,
		"date": "2018-09-29"
	}, {
		"positive_rank": 1,
		"negative_rank": 0,
		"date": "2018-09-30"
	}, {
		"positive_rank": 1,
		"negative_rank": 0,
		"date": "2018-10-06"
	}]
}

const SCHEDULE_DATA_SECRET = {
	participants_count: 5,
	participants: ['A', 'B', 'C', 'D', 'E'],
	dates: [{
		"positive_rank": 1,
		"negative_rank": 0,
		"date": "2018-09-29",
		"positive_participants": [
			"A", "B"
		],
		"negative_participants": [
			"C", "D", "E"
		]
	}, {
		"positive_rank": 1,
		"negative_rank": 0,
		"date": "2018-09-30",
		"positive_participants": [
			"A", "B"
		],
		"negative_participants": [
			"C", "D", "E"
		]

	}, {
		"positive_rank": 1,
		"negative_rank": 0,
		"date": "2018-10-06",
		"positive_participants": [
			"A", "B"
		],
		"negative_participants": [
			"C", "D", "E"
		]
	}]
}

const POLL_PARTICIPANT = 'Fritz'
const POLL_ID = "599a1056-3cea-4c4e-b54c-5fd376f0f632";

const NEW_POLL_BUTTON = 'router-link[name="new-poll-button"]'
const EDIT_EVENT_BUTTON = 'router-link[name="edit-button"]'
const CANCEL_EVENT_BUTTON = 'button[name="cancel-button"]'
const EDIT_POLL_BUTTON = 'button[name="edit-poll-button"]'
const OPEN_EVENT_BUTTON = 'button[name="open-button"]'
const SCHEDULE_EVENT_BUTTON = 'button[name="schedule-button"]'

const buttonSelectors = {
	organizer: {
		open: [EDIT_EVENT_BUTTON, CANCEL_EVENT_BUTTON],
		closed: [OPEN_EVENT_BUTTON],
		openWithParticipants: [EDIT_EVENT_BUTTON, CANCEL_EVENT_BUTTON, SCHEDULE_EVENT_BUTTON]
	},
	guest: {
		open: [
			NEW_POLL_BUTTON,
		],
		openWithParticipants: [
			NEW_POLL_BUTTON,
			EDIT_POLL_BUTTON
		]
	},
	all: [
		NEW_POLL_BUTTON, EDIT_EVENT_BUTTON, CANCEL_EVENT_BUTTON,
		EDIT_POLL_BUTTON, OPEN_EVENT_BUTTON, SCHEDULE_EVENT_BUTTON
	]
}

const EVENT_INTRO = 'p[name="event-intro"]'

function makeEvent(type = 'OPEN', withSecret = false) {
	const eventData = Object.assign({}, EVENT_DATA)

	if (type == 'CANCELED') {
		eventData.state = type
	} else if (type == 'SCHEDULED') {
		eventData.state = type
		eventData.scheduled_from = '2018-10-17T17:30:00.000000Z'
		eventData.scheduled_to = '2018-10-17T19:30:00.000000Z'
	}

	if (!withSecret) {
		delete eventData['secret']
		delete eventData['owner_link']
		delete eventData['email']
		delete eventData['share_link']
	}

	return eventData
}

function makeSchedule(withParticipants = false, withSecret = false) {
	const schedule = Object.assign({}, (withSecret ? SCHEDULE_DATA_SECRET : SCHEDULE_DATA))

	if (!withParticipants) {
		schedule.participants_count = 0
		schedule.participants = []
		schedule.dates = []
	}

	return schedule
}


describe('eventViewer', () => {

	let wrapper
	let restRequest

	describe('when loading fails', () => {

		beforeEach((done) => {

			restRequest = jasmine.createSpy('restRequest').and.returnValue(Promise.reject())

			wrapper = mountEventViewer(restRequest, {
				eventId: EVENT_ID
			})

			setTimeout(done, 0)
		})

		it('does not render the main card', () => {
			expect(wrapper.find('div.card').exists()).toBeFalsy();
		})

		it('shows the error page', () => {
			expect(wrapper.find('error-page').exists()).toBeTruthy()
		})
	})

	describe('without secret', () => {

		describe('open event', () => {

			describe('with participants', () => {

				beforeEach((done) => {

					restRequest = jasmine.createSpy('restRequest').and.callFake((path, config) => {
						if (path == `events/${EVENT_ID}`) {
							return Promise.resolve({
								data: {
									data: makeEvent()
								}
							})
						} else if (path == `events/${EVENT_ID}/schedule`) {
							return Promise.resolve({
								data: {
									data: makeSchedule(true)
								}
							})
						} else if (path == `events/${EVENT_ID}/polls` && config.params.participant == POLL_PARTICIPANT) {
							return Promise.resolve({
								data: {
									data: {
										id: POLL_ID
									}
								}
							})
						}
						return Promise.reject()
					})

					wrapper = mountEventViewer(restRequest, {
						eventId: EVENT_ID
					})

					setTimeout(done, 0)
				})

				it('renders event header', () => {
					let eventHeader = wrapper.find('event-header')
					expect(eventHeader.exists).toBeTruthy();
					expect(eventHeader.attributes('eventname')).toBe(EVENT_DATA.name)
					expect(eventHeader.attributes('eventorganizer')).toBe(EVENT_DATA.organizer)
					expect(eventHeader.attributes('eventstate')).toBe(EVENT_DATA.state)
					expect(eventHeader.attributes('eventscheduledfrom')).toBeUndefined()
					expect(eventHeader.attributes('eventscheduledto')).toBeUndefined()
					expect(eventHeader.attributes('eventtimewindowfrom')).toBeDefined()
					expect(eventHeader.attributes('eventtimewindowto')).toBeDefined()
				})

				it('renders main card', () => {
					expect(wrapper.find('div.card').exists()).toBeTruthy();
				})

				buttonSelectors.all.forEach(selector => {
					if (buttonSelectors.guest.openWithParticipants.indexOf(selector) > -1) {
						it(`renders ${selector}`, () => {
							expect(wrapper.find(selector).exists()).toBeTruthy()
						})
					} else {
						it(`does not render ${selector}`, () => {
							expect(wrapper.find(selector).exists()).toBeFalsy()
						})
					}
				})

				it('renders event intro', () => {
					expect(wrapper.find(EVENT_INTRO).exists()).toBeTruthy()
				})

				it('renders two alerts', () => {
					expect(wrapper.findAll('.alert').length).toBe(2)
				})

				it('renders calendar', () => {
					expect(wrapper.find('v-calendar').exists()).toBeTruthy()
				})

				it('it computes scheduleCalendarAttributes', () => {
					expect(wrapper.vm.scheduleCalendarAttributes.length).toBe(SCHEDULE_DATA.dates.length)
					wrapper.vm.scheduleCalendarAttributes.forEach((attr) => expect(attr.dates instanceof Date).toBeTruthy())
				})

				describe('clicking on update availability', () => {

					beforeEach((done) => {
						wrapper.find(EDIT_POLL_BUTTON).trigger("click")
						setTimeout(done, 0)
					})


					it('opens modal', () => {
						expect(wrapper.find('#updateAnswerModal').visible()).toBeTruthy()
					})

					describe('clicking on the load button', () => {

						beforeEach((done) => {
							wrapper.find('input#pollParticipant').setValue(POLL_PARTICIPANT)
							setTimeout(() => {
								wrapper.find('#updateAnswerModal button.btn.btn-primary').trigger('click')
								setTimeout(done, 0)
							}, 0)
						})

						it('takes user to editor for the poll', () => {
							expect(routerSpy.push).toHaveBeenCalledWith({
								name: 'edit_poll',
								params: {
									pollId: POLL_ID
								}
							})
						})
					})
				})
			})

			describe("without participants", () => {

				beforeEach((done) => {
					restRequest = jasmine.createSpy('restRequest').and.callFake((path, config) => {
						if (path == `events/${EVENT_ID}`) {
							return Promise.resolve({
								data: {
									data: makeEvent()
								}
							})
						} else if (path == `events/${EVENT_ID}/schedule`) {
							return Promise.resolve({
								data: {
									data: makeSchedule(false)
								}
							})
						}
						return Promise.reject()
					})

					wrapper = mountEventViewer(restRequest, {
						eventId: EVENT_ID
					})
					setTimeout(done, 0)
				})

				it('renders event header', () => {
					let eventHeader = wrapper.find('event-header')
					expect(eventHeader.exists).toBeTruthy();
					expect(eventHeader.attributes('eventname')).toBe(EVENT_DATA.name)
					expect(eventHeader.attributes('eventorganizer')).toBe(EVENT_DATA.organizer)
					expect(eventHeader.attributes('eventstate')).toBe(EVENT_DATA.state)
					expect(eventHeader.attributes('eventscheduledfrom')).toBeUndefined()
					expect(eventHeader.attributes('eventscheduledto')).toBeUndefined()
					expect(eventHeader.attributes('eventtimewindowfrom')).toBeDefined()
					expect(eventHeader.attributes('eventtimewindowto')).toBeDefined()
				})

				it('it computes scheduleCalendarAttributes', () => {
					expect(wrapper.vm.scheduleCalendarAttributes.length).toBe(0)
				})

				it('renders main card', () => {
					expect(wrapper.find('div.card').exists()).toBeTruthy();
				})

				it('it computes scheduleCalendarAttributes', () => {
					expect(wrapper.vm.scheduleCalendarAttributes.length).toBe(0)
				})


				buttonSelectors.all.forEach(selector => {
					if (buttonSelectors.guest.open.indexOf(selector) > -1) {
						it(`renders ${selector}`, () => {
							expect(wrapper.find(selector).exists()).toBeTruthy()
						})
					} else {
						it(`does not render ${selector}`, () => {
							expect(wrapper.find(selector).exists()).toBeFalsy()
						})
					}
				})

				it('renders event intro', () => {
					expect(wrapper.find(EVENT_INTRO).exists()).toBeTruthy()
				})

				it('renders two alerts', () => {
					expect(wrapper.findAll('.alert').length).toBe(2)
				})

				it('does not render calendar', () => {
					expect(wrapper.find('v-calendar').exists()).toBeFalsy()
				})
			})
		})

		describe('canceled event', () => {

			beforeEach((done) => {
				restRequest = jasmine.createSpy('restRequest').and.callFake((path, config) => {
					if (path == `events/${EVENT_ID}`) {
						return Promise.resolve({
							data: {
								data: makeEvent('CANCELED')
							}
						})
					} else if (path == `events/${EVENT_ID}/schedule`) {
						return Promise.resolve({
							data: {
								data: makeSchedule(false)
							}
						})
					}
					return Promise.reject()
				})

				wrapper = mountEventViewer(restRequest, {
					eventId: EVENT_ID
				})
				setTimeout(done, 0)
			})

			it('renders event header', () => {
				let eventHeader = wrapper.find('event-header')
				expect(eventHeader.exists).toBeTruthy();
				expect(eventHeader.attributes('eventname')).toBe(EVENT_DATA.name)
				expect(eventHeader.attributes('eventorganizer')).toBe(EVENT_DATA.organizer)
				expect(eventHeader.attributes('eventstate')).toBe("CANCELED")
				expect(eventHeader.attributes('eventscheduledfrom')).toBeUndefined()
				expect(eventHeader.attributes('eventscheduledto')).toBeUndefined()
				expect(eventHeader.attributes('eventtimewindowfrom')).toBeDefined()
				expect(eventHeader.attributes('eventtimewindowto')).toBeDefined()
			})

			it('it computes scheduleCalendarAttributes', () => {
				expect(wrapper.vm.scheduleCalendarAttributes.length).toBe(0)
			})

			it('renders main card', () => {
				expect(wrapper.find('div.card').exists()).toBeTruthy();
			})

			it('renders event intro', () => {
				expect(wrapper.find(EVENT_INTRO).exists()).toBeTruthy()
			})

			it('renders one alert', () => {
				expect(wrapper.findAll('.alert').length).toBe(1)
			})

			it('does not render calendar', () => {
				expect(wrapper.find('v-calendar').exists()).toBeFalsy()
			})

			buttonSelectors.all.forEach(selector => {
				it(`does not render ${selector}`, () => {
					expect(wrapper.find(selector).exists()).toBeFalsy()
				})
			})
		})

		describe('scheduled event', () => {

			beforeEach((done) => {
				restRequest = jasmine.createSpy('restRequest').and.callFake((path, config) => {
					if (path == `events/${EVENT_ID}`) {
						return Promise.resolve({
							data: {
								data: makeEvent('SCHEDULED')
							}
						})
					} else if (path == `events/${EVENT_ID}/schedule`) {
						return Promise.resolve({
							data: {
								data: makeSchedule(false)
							}
						})
					}
					return Promise.reject()
				})

				wrapper = mountEventViewer(restRequest, {
					eventId: EVENT_ID
				})
				setTimeout(done, 0)
			})

			it('renders event header', () => {
				let eventHeader = wrapper.find('event-header')
				expect(eventHeader.exists).toBeTruthy();
				expect(eventHeader.attributes('eventname')).toBe(EVENT_DATA.name)
				expect(eventHeader.attributes('eventorganizer')).toBe(EVENT_DATA.organizer)
				expect(eventHeader.attributes('eventstate')).toBe("SCHEDULED")
				expect(eventHeader.attributes('eventscheduledfrom')).toBeDefined()
				expect(eventHeader.attributes('eventscheduledto')).toBeDefined()
				expect(eventHeader.attributes('eventtimewindowfrom')).toBeDefined()
				expect(eventHeader.attributes('eventtimewindowto')).toBeDefined()
			})

			it('it computes scheduleCalendarAttributes', () => {
				expect(wrapper.vm.scheduleCalendarAttributes.length).toBe(0)
			})

			it('renders main card', () => {
				expect(wrapper.find('div.card').exists()).toBeTruthy();
			})

			it('renders event intro', () => {
				expect(wrapper.find(EVENT_INTRO).exists()).toBeTruthy()
			})

			it('renders one alert', () => {
				expect(wrapper.findAll('.alert').length).toBe(1)
			})

			it('does not render calendar', () => {
				expect(wrapper.find('v-calendar').exists()).toBeFalsy()
			})

			buttonSelectors.all.forEach(selector => {
				it(`does not render ${selector}`, () => {
					expect(wrapper.find(selector).exists()).toBeFalsy()
				})
			})
		})
	})

	describe('with secret', () => {

		describe('open event', () => {

			describe("with participants", () => {

				beforeEach((done) => {

					restRequest = jasmine.createSpy('restRequest').and.callFake((path, config) => {
						if (path == `events/${EVENT_ID}`) {
							return Promise.resolve({
								data: {
									data: makeEvent("OPEN", true)
								}
							})
						} else if (path == `events/${EVENT_ID}/schedule`) {
							return Promise.resolve({
								data: {
									data: makeSchedule(true, true)
								}
							})
						}
						return Promise.reject()
					})

					wrapper = mountEventViewer(restRequest, {
						eventId: EVENT_ID,
						secret: EVENT_SECRET
					})

					setTimeout(done, 0)
				})

				it('renders event header', () => {
					let eventHeader = wrapper.find('event-header')
					expect(eventHeader.exists).toBeTruthy();
					expect(eventHeader.attributes('eventname')).toBe(EVENT_DATA.name)
					expect(eventHeader.attributes('eventorganizer')).toBe(EVENT_DATA.organizer)
					expect(eventHeader.attributes('eventstate')).toBe(EVENT_DATA.state)
					expect(eventHeader.attributes('eventscheduledfrom')).toBeUndefined()
					expect(eventHeader.attributes('eventscheduledto')).toBeUndefined()
					expect(eventHeader.attributes('eventtimewindowfrom')).toBeDefined()
					expect(eventHeader.attributes('eventtimewindowto')).toBeDefined()
				})

				it('renders main card', () => {
					expect(wrapper.find('div.card').exists()).toBeTruthy();
				})

				it('it computes scheduleCalendarAttributes', () => {
					expect(wrapper.vm.scheduleCalendarAttributes.length).toBe(SCHEDULE_DATA.dates.length)
					wrapper.vm.scheduleCalendarAttributes.forEach((attr) => expect(attr.dates instanceof Date).toBeTruthy())
				})

				buttonSelectors.all.forEach(selector => {
					if (buttonSelectors.organizer.openWithParticipants.indexOf(selector) > -1) {
						it(`renders ${selector}`, () => {
							expect(wrapper.find(selector).exists()).toBeTruthy()
						})
					} else {
						it(`does not render ${selector}`, () => {
							expect(wrapper.find(selector).exists()).toBeFalsy()
						})
					}
				})

				it('renders event intro', () => {
					expect(wrapper.find(EVENT_INTRO).exists()).toBeTruthy()
				})

				it('renders two alerts', () => {
					expect(wrapper.findAll('.alert').length).toBe(2)
				})

				it('renders date picker', () => {
					expect(wrapper.find('v-date-picker').exists()).toBeTruthy()
				})

				it('renders the share link input field', () => {
					expect(wrapper.find('input#shareLink').element.value).toBe(EVENT_DATA.share_link)
				})

				it('renders the share button', () => {
					expect(wrapper.find('button[name="share-button"]').exists()).toBeTruthy()
				})

				it('renders the share via Whatsapp button', () => {
					expect(wrapper.find(`a[href="https://wa.me/?text=http%3A%2F%2Flocalhost%3A4000%2Fevents%2F${EVENT_ID}"]`).exists()).toBeTruthy()
				})

				describe('clicking on schedule event', () => {

					beforeEach((done) => {

						wrapper.find(SCHEDULE_EVENT_BUTTON).trigger('click')

						setTimeout(done, 0)
					})

					it('opens modal', () => {
						expect(wrapper.find('#scheduleEventModal').visible()).toBeTruthy()
					})

					describe('clicking on the primary button in the modal without a selected date', () => {

						beforeEach((done) => {

							wrapper.find('#scheduleEventModal button.btn-primary').trigger('click')

							setTimeout(done, 0)
						})

						it('only closes the modal', () => {
							expect(restRequest).toHaveBeenCalledTimes(2)
							expect(wrapper.find('#scheduleEventModal').visible()).toBeFalsy()
						})
					})

					describe('clicking on the primary button in the modal with a selected date', () => {

						beforeEach((done) => {

							wrapper.vm.selectedDate = wrapper.vm.scheduleCalendarAttributes[0].dates
							wrapper.find('#scheduleEventModal button.btn-primary').trigger('click')

							setTimeout(done, 0)
						})

						it('schedules the event', () => {
							expect(restRequest).toHaveBeenCalledWith(`events/${EVENT_ID}`, {
								method: 'patch',
								data: {
									event: {
										state: 'SCHEDULED',
										secret: EVENT_SECRET,
										scheduled_from: '2018-09-29T19:30:00.000Z',
										scheduled_to: '2018-09-30T01:30:00.000Z'
									}
								}
							});
							expect(wrapper.find('#scheduleEventModal').visible()).toBeFalsy()
						})
					})
				})

				describe('clicking on cancel event', () => {

					beforeEach((done) => {

						wrapper.find(CANCEL_EVENT_BUTTON).trigger('click')

						setTimeout(done, 0)
					})

					it('opens modal', () => {
						expect(wrapper.find('#cancelEventModal').visible()).toBeTruthy()
					})

					describe('clicking on cancel within the modal', () => {

						beforeEach((done) => {

							wrapper.find('#cancelEventModal button.btn-primary').trigger('click')

							setTimeout(done, 0)
						})

						it('cancels the event', () => {
							expect(restRequest).toHaveBeenCalledWith(`events/${EVENT_ID}`, {
								method: 'patch',
								data: {
									event: {
										state: 'CANCELED',
										secret: EVENT_SECRET
									}
								}
							})
						})
					})
				})
			})

			describe("without participants", () => {

				beforeEach((done) => {
					restRequest = jasmine.createSpy('restRequest').and.callFake((path, config) => {
						if (path == `events/${EVENT_ID}`) {
							return Promise.resolve({
								data: {
									data: makeEvent('OPEN', true)
								}
							})
						} else if (path == `events/${EVENT_ID}/schedule`) {
							return Promise.resolve({
								data: {
									data: makeSchedule(false, true)
								}
							})
						}
						return Promise.reject()
					})

					wrapper = mountEventViewer(restRequest, {
						eventId: EVENT_ID,
						secret: EVENT_SECRET
					})
					setTimeout(done, 0)
				})

				it('renders event header', () => {
					let eventHeader = wrapper.find('event-header')
					expect(eventHeader.exists).toBeTruthy();
					expect(eventHeader.attributes('eventname')).toBe(EVENT_DATA.name)
					expect(eventHeader.attributes('eventorganizer')).toBe(EVENT_DATA.organizer)
					expect(eventHeader.attributes('eventstate')).toBe(EVENT_DATA.state)
					expect(eventHeader.attributes('eventscheduledfrom')).toBeUndefined()
					expect(eventHeader.attributes('eventscheduledto')).toBeUndefined()
					expect(eventHeader.attributes('eventtimewindowfrom')).toBeDefined()
					expect(eventHeader.attributes('eventtimewindowto')).toBeDefined()
				})

				it('it computes scheduleCalendarAttributes', () => {
					expect(wrapper.vm.scheduleCalendarAttributes.length).toBe(0)
				})

				it('renders main card', () => {
					expect(wrapper.find('div.card').exists()).toBeTruthy();
				})

				it('it computes scheduleCalendarAttributes', () => {
					expect(wrapper.vm.scheduleCalendarAttributes.length).toBe(0)
				})


				buttonSelectors.all.forEach(selector => {
					if (buttonSelectors.organizer.open.indexOf(selector) > -1) {
						it(`renders ${selector}`, () => {
							expect(wrapper.find(selector).exists()).toBeTruthy()
						})
					} else {
						it(`does not render ${selector}`, () => {
							expect(wrapper.find(selector).exists()).toBeFalsy()
						})
					}
				})

				it('renders event intro', () => {
					expect(wrapper.find(EVENT_INTRO).exists()).toBeTruthy()
				})

				it('renders two alert', () => {
					expect(wrapper.findAll('.alert').length).toBe(2)
				})

				it('does not render date picker', () => {
					expect(wrapper.find('v-date-picker').exists()).toBeFalsy()
				})
			})
		})

		describe('canceled event', () => {

			beforeEach((done) => {
				restRequest = jasmine.createSpy('restRequest').and.callFake((path, config) => {
					if (path == `events/${EVENT_ID}`) {
						return Promise.resolve({
							data: {
								data: makeEvent('CANCELED', true)
							}
						})
					} else if (path == `events/${EVENT_ID}/schedule`) {
						return Promise.resolve({
							data: {
								data: makeSchedule(false, true)
							}
						})
					}
					return Promise.reject()
				})

				wrapper = mountEventViewer(restRequest, {
					eventId: EVENT_ID,
					secret: EVENT_SECRET
				})
				setTimeout(done, 0)
			})

			it('renders event header', () => {
				let eventHeader = wrapper.find('event-header')
				expect(eventHeader.exists).toBeTruthy();
				expect(eventHeader.attributes('eventname')).toBe(EVENT_DATA.name)
				expect(eventHeader.attributes('eventorganizer')).toBe(EVENT_DATA.organizer)
				expect(eventHeader.attributes('eventstate')).toBe("CANCELED")
				expect(eventHeader.attributes('eventscheduledfrom')).toBeUndefined()
				expect(eventHeader.attributes('eventscheduledto')).toBeUndefined()
				expect(eventHeader.attributes('eventtimewindowfrom')).toBeDefined()
				expect(eventHeader.attributes('eventtimewindowto')).toBeDefined()
			})

			it('it computes scheduleCalendarAttributes', () => {
				expect(wrapper.vm.scheduleCalendarAttributes.length).toBe(0)
			})

			it('renders main card', () => {
				expect(wrapper.find('div.card').exists()).toBeTruthy();
			})

			it('renders event intro', () => {
				expect(wrapper.find(EVENT_INTRO).exists()).toBeTruthy()
			})

			it('renders one alert', () => {
				expect(wrapper.findAll('.alert').length).toBe(1)
			})

			it('does not render the date picker', () => {
				expect(wrapper.find('v-date-picker').exists()).toBeFalsy()
			})

			buttonSelectors.all.forEach(selector => {
				if (buttonSelectors.organizer.closed.indexOf(selector) > -1) {
					it(`renders ${selector}`, () => {
						expect(wrapper.find(selector).exists()).toBeTruthy()
					})
				} else {
					it(`does not render ${selector}`, () => {
						expect(wrapper.find(selector).exists()).toBeFalsy()
					})
				}
			})

			describe('when clicking on reopen event', () => {

				beforeEach((done) => {

					wrapper.find(OPEN_EVENT_BUTTON).trigger('click')

					setTimeout(done, 0)
				})

				it('reopens the event', () => {

					expect(restRequest).toHaveBeenCalledWith(`events/${EVENT_ID}`, {
						method: 'patch',
						data: {
							event: {
								state: "OPEN",
								secret: EVENT_SECRET,
								scheduled_from: null,
								scheduled_to: null
							}
						}
					})
				})
			})
		})

		describe('scheduled event', () => {

			beforeEach((done) => {
				restRequest = jasmine.createSpy('restRequest').and.callFake((path, config) => {
					if (path == `events/${EVENT_ID}`) {
						return Promise.resolve({
							data: {
								data: makeEvent('SCHEDULED', true)
							}
						})
					} else if (path == `events/${EVENT_ID}/schedule`) {
						return Promise.resolve({
							data: {
								data: makeSchedule(false, true)
							}
						})
					}
					return Promise.reject()
				})

				wrapper = mountEventViewer(restRequest, {
					eventId: EVENT_ID,
					secret: EVENT_SECRET
				})
				setTimeout(done, 0)
			})

			it('renders event header', () => {
				let eventHeader = wrapper.find('event-header')
				expect(eventHeader.exists).toBeTruthy();
				expect(eventHeader.attributes('eventname')).toBe(EVENT_DATA.name)
				expect(eventHeader.attributes('eventorganizer')).toBe(EVENT_DATA.organizer)
				expect(eventHeader.attributes('eventstate')).toBe("SCHEDULED")
				expect(eventHeader.attributes('eventscheduledfrom')).toBeDefined()
				expect(eventHeader.attributes('eventscheduledto')).toBeDefined()
				expect(eventHeader.attributes('eventtimewindowfrom')).toBeDefined()
				expect(eventHeader.attributes('eventtimewindowto')).toBeDefined()
			})

			it('it computes scheduleCalendarAttributes', () => {
				expect(wrapper.vm.scheduleCalendarAttributes.length).toBe(0)
			})

			it('renders main card', () => {
				expect(wrapper.find('div.card').exists()).toBeTruthy();
			})

			it('renders event intro', () => {
				expect(wrapper.find(EVENT_INTRO).exists()).toBeTruthy()
			})

			it('renders one alert', () => {
				expect(wrapper.findAll('.alert').length).toBe(1)
			})

			it('does not render the date picker', () => {
				expect(wrapper.find('v-date-picker').exists()).toBeFalsy()
			})

			buttonSelectors.all.forEach(selector => {
				if (buttonSelectors.organizer.closed.indexOf(selector) > -1) {
					it(`renders ${selector}`, () => {
						expect(wrapper.find(selector).exists()).toBeTruthy()
					})
				} else {
					it(`does not render ${selector}`, () => {
						expect(wrapper.find(selector).exists()).toBeFalsy()
					})
				}
			})
		})
	})
})