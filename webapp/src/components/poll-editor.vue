<template lang="pug">
  div
    message-bar(ref="errorBar" variant="danger")
    b-modal#poll-saved-modal(
      static=true
      hide-header
      ok-only
      :ok-title="$t('poll_editor.back_to_event')"
      @hidden="backToEvent"
    )
      p {{ $t('poll_editor.poll_saved') }}

    b-modal#poll-delete-modal(
      static=true
      :title="$t('poll_editor.delete_poll')"
      @ok="deletePoll"
      :ok-title="$t('poll_editor.delete_poll')"
      :cancel-title="$t('actions.cancel')"
      :ok-disabled="requestOngoing"
      ok-variant="danger"
    )
      p {{ $t('poll_editor.really_delete') }}

    b-modal#poll-deleted-modal(
      static=true
      :title="$t('poll_editor.delete_poll')"
      ok-only
      :ok-title="$t('poll_editor.back_to_event')"
      @hidden="backToEvent"
    )
      p {{ $t('poll_editor.poll_deleted') }}

    b-modal#poll-delete-error-modal(
      static=true
      :title="$t('errors.error')"
      ok-only
    )
      p {{ $t('poll_editor.poll_delete_error') }}

    b-modal#event-error-modal(
      static=true
      hide-header
      :ok-title="$t('poll_editor.back_to_event')"
      ok-only
      no-close-on-esc
      no-close-on-backdrop
      @ok="backToEvent"
    )
      p {{ eventError }}

    .card(v-if="loadedSuccessfully" name="main-card")
      .card-header(:class="eventBackgroundClass")
        event-header#event-header(
          v-bind="eventData"
        )
      .card-body
        .alert.alert-info(v-if="pollId")
          i.fas.fa-edit
          | &nbsp; {{ $t('poll_editor.welcome', {participant: pollParticipant}) }}
        .alert.alert-info(v-else)
          i.fas.fa-edit
          | &nbsp; {{ $t('poll_editor.welcome_new_participant') }}
        .alert.alert-danger(v-if="emptyDomain")
          i.fas.fa-exclamation-triangle
          | &nbsp; {{ $t('event_viewer.empty_domain') }}
        div(v-else)
          progress-header.mb-1(
            :step="step"
            :maxStep="maxStep"
            :minStep="minStep"
          )
          //- if we have an eventId, we are creating a new poll and not editing an existing one
          b-card(
            v-if="step == errorsMap['participant-group'].step"
            :header-bg-variant="groupBgVariant('participant-group')"
            header-text-variant="white"
          )
            .d-flex(slot="header")
              .flex-grow-1 {{ $t('poll_editor.participant_group') }}
              .fas.fa-exclamation(v-if="showGroupErrorIcon('participant-group')")
              .fas.fa-check(v-else-if="showGroupOkIcon('participant-group')")
            .form-group.row
              label.col-md-3.col-form-label(for="pollParticipant") {{ $t('poll_editor.poll.participant') }}
              .col-md-9
                small.form-text.text-muted {{ $t('poll_editor.poll.participant_help') }}
                input#pollParticipant.form-control(
                  v-model.trim="pollParticipant"
                  @change="localValidation"
                  @blur="localValidation"
                  :class="inputFieldClass('pollParticipant')"
                )
                .invalid-feedback(name="poll-participant-error") {{ pollParticipantError }}

          b-card(
            v-if="step == errorsMap['calendar-ranker-group'].step"
            :header-bg-variant="groupBgVariant('calendar-ranker-group')"
            header-text-variant="white"
          )
            .d-flex(slot="header")
              .flex-grow-1 {{ $t('poll_editor.calendar_ranker_group') }}
              .fas.fa-exclamation(v-if="showGroupErrorIcon('calendar-ranker-group')")
              .fas.fa-check(v-else-if="showGroupOkIcon('calendar-ranker-group')")
            .form-group.row
              .col.text-center.text-justify
                i18n.small.text-muted(path="poll_editor.date_ranker_helper" tag="p")
                  template(v-slot:good)
                    i.fas.fa-thumbs-up.text-success
                  template(v-slot:bad)
                    i.fas.fa-thumbs-down.text-danger
                  template(v-slot:indifferent)
                    i.fas.fa-circle.text-warning

            .form-group.row.justify-content-center.justify-content-md-between.justify-content-lg-center
              .col-md-7.mb-4.text-center
                v-date-picker#pollDateRanks(
                  mode="single"
                  :locale="$i18n.locale"
                  v-model="dateSelection"
                  nav-visibility="hidden"
                  :is-inline="true"
                  :is-required="true"
                  :columns="calendarColumns"
                  :attributes="datePickerAttributes"
                  :min-date="minDate"
                  :max-date="maxDate"
                  popover-visibility="hidden"
                  :select-attribute="selectAttribute"
                  :available-dates="eventDomain"
                  @input="newDate"
                  :is-expanded="true"
                )
                .small.text-danger(name="poll-date-ranks-error") {{ pollDateRanksError }}

                .d-flex.mt-2.justify-content-center.align-items-end(@click="clearDateSelection")
                  .form-check
                    p-radio.p-icon.p-plain(name="selectedDateRank" :value="1" v-model="selectedDateRank" toggle)
                      i.icon.fas.fa-thumbs-up.text-success(slot="extra")
                      i.icon.far.fa-thumbs-up(slot="off-extra")
                      label(slot="off-label")
                  .form-check
                    p-radio.p-icon.p-plain(name="selectedDateRank" :value="-1" v-model="selectedDateRank" toggle)
                      i.icon.fas.fa-thumbs-down.text-danger(slot="extra")
                      i.icon.far.fa-thumbs-down(slot="off-extra")
                      label(slot="off-label")
                  .form-check
                    p-radio.p-icon.p-plain(name="selectedDateRank" :value="0" v-model="selectedDateRank" toggle)
                      i.icon.fas.fa-circle.text-warning(slot="extra")
                      i.icon.far.fa-circle(slot="off-extra")
                      label(slot="off-label")

              .col-11.col-md-5
                ranker#pollWeekdayRanks(:elements="pollWeekdayRanks")
                .small.text-danger(name="poll-weekday-rank-error") {{ pollWeekdayRanksError }}


      .card-footer
        .row.justify-content-around
          .col-12.col-sm-2.order-sm-last.mt-1
            button.btn.btn-block.btn-primary(@click="nextStep" :disabled="requestOngoing")
              span(v-if="step < maxStep" name="forward-button")
                i.fas.fa-arrow-circle-right
                | &nbsp; {{ $t('actions.next') }}
              span(v-else name="save-poll-button")
                i.fas.fa-save
                | &nbsp; {{ $t('poll_editor.save_poll') }}
          .col-12.col-sm-2.mt-1(v-if="pollId && eventOpen && !emptyDomain")
            button.btn.btn-block.btn-danger(name="delete-poll-button" v-b-modal.poll-delete-modal="" :disabled="requestOngoing")
              i.fas.fa-trash-alt
              | &nbsp; {{ $t('poll_editor.delete_poll') }}
          .col-12.col-sm-2.order-sm-first.mt-1(v-if="step == minStep")
            button.btn.btn-block.btn-secondary(@click="backToEvent" :disabled="requestOngoing" name="back-to-event-button")
              i.fas.fa-ban
              | &nbsp; {{ $t('actions.cancel') }}
          .col-12.col-sm-2.mt-1(v-if="step > minStep")
            button.btn.btn-block.btn-secondary(@click="prevStep" :disabled="step == minStep || requestOngoing" name="back-button")
              i.fas.fa-arrow-circle-left
              | &nbsp; {{ $t('actions.prev') }}
    error-page(
      v-else-if="loaded"
      :message="$t('errors.not_found')"
    )
</template>
<script>
  import * as dateFns from 'date-fns'

  import errorBarMixin from '../mixins/error-bar'
  import stepValidationMixin from '../mixins/step-validation'
  import restMixin from '../mixins/rest'
  import pollDataMixin from '../mixins/poll-data'
  import eventHelpersMixin from '../mixins/event-helpers'
  import eventDataMixin from '../mixins/event-data'
  import {scrollToTopMixin} from '../mixins/utils'

  export default {
    mixins: [stepValidationMixin, errorBarMixin, pollDataMixin, restMixin, scrollToTopMixin, eventHelpersMixin, eventDataMixin],
    props: {
      eventId: String,
      pollId: String,
      forceStep: Number // for testing
    },
    data() {
      return {
        errorsMap: {
          'general': {
            fields: {
              event: {
                errorField: 'eventError',
                errorKeys: 'event'
              }
            }
          },
          'participant-group': {
            step: 1,
            fields: {
              pollParticipant: {
                required: true,
                errorField: 'pollParticipantError',
                errorKeys: 'participant'
              }
            }
          },
          'calendar-ranker-group': {
            step: 2,
            fields: {
              pollDateRanks: {
                errorField: 'pollDateRanksError',
                errorKeys: 'date_ranks'
              },
              pollWeekdayRanks: {
                errorField: 'pollWeekdayRanksError',
                errorKeys: 'preferences.weekday_ranks'
              }
            }
          }
        },
        eventError: null,
        pollParticipantError: null,
        pollWeekdayRanksError: null,
        pollDateRanksError: null,
        requestOngoing: false,
        loaded: false,
        loadedSuccessfully: false,
        dateSelection: null,
        selectedDateRank: 1,
        step: this.forceStep || 1,
        minStep: 1,
        maxStep: 2,
        selectAttribute: {
          highlight: {
            class: 'bg-light'
          }
        }
      }
    },
    async created() {
      if (this.eventId) {
        try {
          const response = await this.restRequest(['events', this.eventId].join('/'))
          this.assignEventData(response.data.data)
          this.assignPollData({}, this.eventWeekdays)
          this.checkEventValid()
          this.loadedSuccessfully = true
        } finally {
          this.loaded = true
        }
      } else {
        try {
          const response = await this.restRequest(['polls', this.pollId].join('/'))
          this.assignEventData(response.data.data.event)
          this.assignPollData(response.data.data, this.eventWeekdays)
          this.eventIdFromPoll = response.data.data.event_id
          this.checkEventValid()
          this.loadedSuccessfully = true
          this.minStep = 2
          this.step = this.forceStep || this.minStep
        } finally {
          this.loaded = true
        }
      }
    },
    methods: {
      checkEventValid() {
        if (!this.eventOpen || this.emptyDomain) {
          this.eventError = this.$i18n.t('poll_editor.event_invalid')
          this.$bvModal.show('event-error-modal')
        }
      },
      clearDateSelection() {
        // done in the next update cycle otherwise ineffective
        // when called from the newDate handler
        setTimeout(() => this.dateSelection = null, 0);
      },
      async savePoll(dry_run = false) {
        try {
          const result = await this.restRequest(
            (this.pollId ? ['polls', this.pollId].join('/') : ['events', this.eventId, 'polls'].join('/')), {
              method: (this.pollId ? 'put' : 'post'),
              data: {
                poll: this.pollDataForRequest,
                dry_run
              }
            }
          )
          this.setServerErrors()
          this.scrollToTop()

          if (result.status !== 204) {
            this.$bvModal.show('poll-saved-modal');
          }
        } catch (error) {
          if (error.response && error.response.status === 422) {
            this.setServerErrors(error.response.data.errors);
            if (this.firstStepWithErrors && this.firstStepWithErrors <= this.step) {
              this.showErrorCodeInErrorBar(error.response.status)
            } else if (this.eventError) {
              this.scrollToTop()
              this.$bvModal.show('event-error-modal');
            }
          } else {
            throw error;
          }
        }
      },
      async deletePoll() {
        try {
          await this.restRequest(['polls', this.pollId].join('/'), {
            method: 'delete'
          })
          this.$bvModal.show('poll-deleted-modal');
        } catch (error) {
          this.$bvModal.show('poll-delete-error-modal');
          throw error;
        }
      },
      backToEvent() {
        this.$router.push({
          name: 'event',
          params: {
            eventId: this.computedEventId
          }
        });
      },
      async nextStep() {
        await this.savePoll(this.step < this.maxStep)
        this.step = Math.min(this.step + 1, this.maxStep, this.firstStepWithErrors || this.maxStep)
      },
      prevStep() {
        if (this.step > this.minStep) {
          this.step--
        }
      },
      classForRank: (rank) => (rank > 0 ? 'bg-success' : (rank < 0 ? 'bg-danger' : 'bg-warning')),
      newDate(value) {
        if (value && this.eventDomain.length > 0) {
          let new_key = this.datesKey(value)
          let toReplace = this.pollDateRanks.findIndex(({
                                                          key
                                                        }) => key === new_key)

          if (this.selectedDateRank) {
            this.pollDateRanks.splice(toReplace, (toReplace < 0 ? 0 : 1), {
              date: value,
              key: new_key,
              rank: this.selectedDateRank
            })
          } else if (toReplace >= 0) {
            this.pollDateRanks.splice(toReplace, 1)
          }
        }
        this.clearDateSelection()
      }
    },
    computed: {
      calendarColumns() {
        return this.$screens({
          default: 1,
          lg: this.differentMonths ? 2 : 1
        })
      },
      datePickerAttributes() {
        return this.eventDomain.map(date => {
          let dateRank = this.pollDateRanks.find(({
                                                    date: rank_date
                                                  }) => dateFns.isEqual(date, rank_date))

          if (dateRank) {
            return {
              key: dateRank.key,
              dates: date,
              highlight: {
                class: this.classForRank(dateRank.rank)
              }
            }
          }

          let weekdayRank = this.pollWeekdayRanks.find(({
                                                          day
                                                        }) => ((day + 1) % 7) === dateFns.getDay(date))

          if (weekdayRank) {
            return {
              dates: date,
              highlight: {
                class: this.classForRank(weekdayRank.value)
              }
            }
          }

          return {
            dates: date,
            highlight: {
              class: this.classForRank(0)
            }
          }
        })
      },
      computedEventId() {
        return this.eventId || this.eventIdFromPoll;
      }
    }
  }
</script>
